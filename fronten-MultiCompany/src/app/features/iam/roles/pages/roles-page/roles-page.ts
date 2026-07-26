import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { ColumnDef } from '@tanstack/angular-table';
import { LucidePencil, LucideShieldCheck, LucideTrash2 } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { ConfirmService } from '@/app/shared/confirm/confirm.service';
import { Card } from '@/app/shared/ui/card/card';
import { DataTable } from '@/app/shared/ui/data-table/data-table';
import { DataTableCell, DataTableMobileTitle } from '@/app/shared/ui/data-table/data-table-cell.directive';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { SearchInput } from '@/app/shared/ui/search-input/search-input';
import type { Role } from '../../../shared/models/iam.model';
import { activeCompanyId } from '../../../shared/lib/active-company-id';
import { RolesService } from '../../../shared/services/roles.service';
import { RoleFormDialog } from '../../components/role-form-dialog/role-form-dialog';
import { RolePermissionsDialog } from '../../components/role-permissions-dialog/role-permissions-dialog';

const COLUMNS: ColumnDef<Role, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Rol' },
  { id: 'description', accessorKey: 'description', header: 'Descripción' },
  { id: 'actions', header: 'Acciones', size: 140, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-roles-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CanDirective,
    Card,
    DataTable,
    DataTableCell,
    DataTableMobileTitle,
    ButtonDirective,
    SearchInput,
    RoleFormDialog,
    RolePermissionsDialog,
    LucidePencil,
    LucideShieldCheck,
    LucideTrash2,
  ],
  templateUrl: './roles-page.html',
})
export class RolesPage {
  private readonly rolesService = inject(RolesService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly companyId = activeCompanyId();
  protected readonly columns = COLUMNS;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly roles = signal<Role[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly formDialogOpen = signal(false);
  protected readonly editingRoleId = signal<string | null>(null);
  protected readonly permissionsDialogOpen = signal(false);
  protected readonly permissionsRole = signal<Role | null>(null);

  constructor() {
    if (this.companyId) void this.loadRoles();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.applySearch());
  }

  private allRoles: Role[] = [];

  protected async loadRoles(): Promise<void> {
    if (!this.companyId) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.allRoles = await firstValueFrom(this.rolesService.getRoles(this.companyId));
      this.applySearch();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los roles.');
    } finally {
      this.loading.set(false);
    }
  }

  private applySearch(): void {
    const query = this.search.value.trim().toLowerCase();
    if (!query) {
      this.roles.set(this.allRoles);
      return;
    }
    this.roles.set(
      this.allRoles.filter(
        (role) => role.name.toLowerCase().includes(query) || (role.description ?? '').toLowerCase().includes(query),
      ),
    );
  }

  protected openCreateDialog(): void {
    this.editingRoleId.set(null);
    this.formDialogOpen.set(true);
  }

  protected openEditDialog(role: Role): void {
    this.editingRoleId.set(role.id);
    this.formDialogOpen.set(true);
  }

  protected openPermissionsDialog(role: Role): void {
    this.permissionsRole.set(role);
    this.permissionsDialogOpen.set(true);
  }

  protected async deleteRole(role: Role): Promise<void> {
    if (!this.companyId) return;
    const confirmed = await this.confirmService.confirm(
      `¿Eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
      'Eliminar rol',
    );
    if (!confirmed) return;

    try {
      await firstValueFrom(this.rolesService.deleteRole(this.companyId, role.id));
      await this.loadRoles();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo eliminar el rol.');
    }
  }
}
