import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@/app/core/http/api-error';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { CheckboxDirective } from '@/app/shared/ui/directives/checkbox.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { SkeletonDirective } from '@/app/shared/ui/directives/skeleton.directive';
import type { Permission } from '../../../shared/models/iam.model';
import { PermissionCatalogService } from '../../../shared/services/permissions.service';
import { RolesService } from '../../../shared/services/roles.service';

const ACTION_LABELS: Record<string, string> = {
  view: 'Ver',
  read: 'Leer',
  create: 'Crear',
  update: 'Actualizar',
  delete: 'Eliminar',
  export: 'Exportar',
  approve: 'Aprobar',
  assign_permissions: 'Asignar permisos',
  assign_roles: 'Asignar roles',
  manage_modules: 'Gestionar módulos',
};

function actionLabel(key: string): string {
  const action = key.split('.').pop() ?? key;
  return ACTION_LABELS[action] ?? action;
}

// Formato de key: {sistema}.{módulo}.{acción} — se agrupa por módulo.
function groupKey(key: string): string {
  return key.split('.')[1] ?? key;
}

@Component({
  selector: 'app-role-permissions-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, ButtonDirective, CheckboxDirective, SkeletonDirective],
  templateUrl: './role-permissions-dialog.html',
})
export class RolePermissionsDialog {
  readonly open = input(false);
  readonly companyId = input.required<string>();
  readonly roleId = input<string | null>(null);
  readonly roleName = input<string>('');

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly rolesService = inject(RolesService);
  private readonly permissionCatalog = inject(PermissionCatalogService);

  protected readonly allPermissions = signal<Permission[]>([]);
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly loading = signal(false);
  protected readonly ready = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly groups = computed(() => {
    const groupsMap = new Map<string, Permission[]>();
    for (const permission of this.allPermissions()) {
      const key = groupKey(permission.key);
      const list = groupsMap.get(key) ?? [];
      list.push(permission);
      groupsMap.set(key, list);
    }
    return Array.from(groupsMap.entries());
  });

  constructor() {
    effect(() => {
      if (this.open()) void this.initialize();
    });
  }

  private async initialize(): Promise<void> {
    const companyId = this.companyId();
    const roleId = this.roleId();
    if (roleId === null) return;

    this.errorMessage.set(null);
    this.ready.set(false);
    this.loading.set(true);
    this.selectedIds.set(new Set());

    try {
      const [permissions, detail] = await Promise.all([
        firstValueFrom(this.permissionCatalog.getAllPermissions()),
        firstValueFrom(this.rolesService.getRoleById(companyId, roleId)),
      ]);
      this.allPermissions.set(permissions);
      this.selectedIds.set(new Set(detail.permissions.map((p) => p.id)));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los permisos.');
    } finally {
      this.loading.set(false);
      this.ready.set(true);
    }
  }

  protected actionLabel = actionLabel;

  protected isChecked(permissionId: string): boolean {
    return this.selectedIds().has(permissionId);
  }

  protected toggle(permissionId: string, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) next.add(permissionId);
    else next.delete(permissionId);
    this.selectedIds.set(next);
  }

  protected async onSave(): Promise<void> {
    const roleId = this.roleId();
    if (roleId === null || !this.ready()) return;

    this.errorMessage.set(null);
    this.saving.set(true);

    try {
      await firstValueFrom(
        this.rolesService.assignPermissionsToRole(this.companyId(), roleId, Array.from(this.selectedIds())),
      );
      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron guardar los permisos.');
    } finally {
      this.saving.set(false);
    }
  }
}
