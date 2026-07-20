import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { ConfirmService } from '@/app/shared/confirm/confirm.service';
import { Badge } from '@/app/shared/ui/badge/badge';
import { Card } from '@/app/shared/ui/card/card';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { SkeletonDirective } from '@/app/shared/ui/directives/skeleton.directive';
import { ENTITY_STATUS } from '../../../shared/models/iam.model';
import { activeCompanyId } from '../../../shared/lib/active-company-id';
import { ChangePasswordDialog } from '../../components/change-password-dialog/change-password-dialog';
import { UserFormDialog } from '../../components/user-form-dialog/user-form-dialog';
import type { IamUser } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

type SortKey = 'fullName' | 'email' | 'status';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CanDirective,
    Badge,
    Card,
    ButtonDirective,
    InputDirective,
    SkeletonDirective,
    UserFormDialog,
    ChangePasswordDialog,
  ],
  templateUrl: './users-page.html',
})
export class UsersPage {
  private readonly usersService = inject(UsersService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly companyId = activeCompanyId();
  protected readonly ENTITY_STATUS = ENTITY_STATUS;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly users = signal<IamUser[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly sortKey = signal<SortKey>('fullName');
  protected readonly sortAsc = signal(true);

  protected readonly formDialogOpen = signal(false);
  protected readonly editingUserId = signal<string | null>(null);
  protected readonly passwordDialogOpen = signal(false);
  protected readonly passwordUserId = signal<string | null>(null);

  protected readonly sortedUsers = computed(() => {
    const key = this.sortKey();
    const dir = this.sortAsc() ? 1 : -1;
    return [...this.users()].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  });

  constructor() {
    if (this.companyId) void this.loadUsers();

    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      void this.loadUsers();
    });
  }

  protected async loadUsers(): Promise<void> {
    if (!this.companyId) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const result = await firstValueFrom(
        this.usersService.getUsers(this.companyId, { page: 1, size: 50, search: this.search.value || undefined }),
      );
      this.users.set(result.items);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los usuarios.');
    } finally {
      this.loading.set(false);
    }
  }

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) this.sortAsc.update((asc) => !asc);
    else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  protected openCreateDialog(): void {
    this.editingUserId.set(null);
    this.formDialogOpen.set(true);
  }

  protected openEditDialog(user: IamUser): void {
    this.editingUserId.set(user.id);
    this.formDialogOpen.set(true);
  }

  protected openPasswordDialog(user: IamUser): void {
    this.passwordUserId.set(user.id);
    this.passwordDialogOpen.set(true);
  }

  protected async toggleStatus(user: IamUser): Promise<void> {
    if (!this.companyId) return;
    const isActive = user.status === ENTITY_STATUS.ACTIVE;
    const confirmed = await this.confirmService.confirm(
      isActive
        ? `¿Desactivar a ${user.fullName}? No podrá iniciar sesión hasta que se reactive.`
        : `¿Reactivar a ${user.fullName}?`,
      isActive ? 'Desactivar usuario' : 'Reactivar usuario',
    );
    if (!confirmed) return;

    try {
      if (isActive) await firstValueFrom(this.usersService.deactivateUser(this.companyId, user.id));
      else await firstValueFrom(this.usersService.reactivateUser(this.companyId, user.id));
      await this.loadUsers();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo actualizar el estado.');
    }
  }
}
