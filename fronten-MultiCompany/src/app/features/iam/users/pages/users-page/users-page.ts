import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { ColumnDef } from '@tanstack/angular-table';
import { LucideKeyRound, LucidePencil, LucideUserCheck, LucideUserX } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { ConfirmService } from '@/app/shared/confirm/confirm.service';
import { Badge } from '@/app/shared/ui/badge/badge';
import { Card } from '@/app/shared/ui/card/card';
import { DataTable } from '@/app/shared/ui/data-table/data-table';
import { DataTableCell, DataTableMobileTitle } from '@/app/shared/ui/data-table/data-table-cell.directive';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { FilterPopover } from '@/app/shared/ui/filter-popover/filter-popover';
import { SearchInput } from '@/app/shared/ui/search-input/search-input';
import { ENTITY_STATUS } from '../../../shared/models/iam.model';
import { activeCompanyId } from '../../../shared/lib/active-company-id';
import { ChangePasswordDialog } from '../../components/change-password-dialog/change-password-dialog';
import { UserFormDialog } from '../../components/user-form-dialog/user-form-dialog';
import type { IamUser } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

const COLUMNS: ColumnDef<IamUser, unknown>[] = [
  { id: 'fullName', accessorKey: 'fullName', header: 'Nombre completo' },
  { id: 'email', accessorKey: 'email', header: 'Correo' },
  { id: 'status', accessorKey: 'status', header: 'Estado', size: 120 },
  { id: 'actions', header: 'Acciones', size: 140, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-users-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CanDirective,
    Badge,
    Card,
    DataTable,
    DataTableCell,
    DataTableMobileTitle,
    ButtonDirective,
    InputDirective,
    LabelDirective,
    FilterPopover,
    SearchInput,
    UserFormDialog,
    ChangePasswordDialog,
    LucidePencil,
    LucideKeyRound,
    LucideUserX,
    LucideUserCheck,
  ],
  templateUrl: './users-page.html',
})
export class UsersPage {
  private readonly usersService = inject(UsersService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly companyId = activeCompanyId();
  protected readonly ENTITY_STATUS = ENTITY_STATUS;
  protected readonly columns = COLUMNS;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly users = signal<IamUser[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Filtro de estado: el select edita un borrador y "Aplicar filtros" lo confirma.
  // Se aplica en cliente sobre la página cargada (el backend no expone ?status aún).
  protected readonly statusDraft = new FormControl<number | null>(null);
  private readonly appliedStatus = signal<number | null>(null);
  protected readonly filteredUsers = computed(() => {
    const status = this.appliedStatus();
    const list = this.users();
    return status === null ? list : list.filter((user) => user.status === status);
  });
  protected readonly activeFilterCount = computed(() => (this.appliedStatus() === null ? 0 : 1));

  protected readonly formDialogOpen = signal(false);
  protected readonly editingUserId = signal<string | null>(null);
  protected readonly passwordDialogOpen = signal(false);
  protected readonly passwordUserId = signal<string | null>(null);

  constructor() {
    if (this.companyId) void this.loadUsers();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => void this.loadUsers());
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

  protected applyFilters(): void {
    this.appliedStatus.set(this.statusDraft.value);
  }

  protected resetFilters(): void {
    this.statusDraft.setValue(null);
    this.appliedStatus.set(null);
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
