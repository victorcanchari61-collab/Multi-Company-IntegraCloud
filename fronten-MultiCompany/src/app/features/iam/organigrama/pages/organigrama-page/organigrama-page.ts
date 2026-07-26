import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LucidePlus } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { Card } from '@/app/shared/ui/card/card';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { SkeletonDirective } from '@/app/shared/ui/directives/skeleton.directive';
import type { RoleTreeDto } from '../../../shared/models/iam.model';
import { activeCompanyId } from '../../../shared/lib/active-company-id';
import { RolesService } from '../../../shared/services/roles.service';
import { RoleFormDialog } from '../../../roles/components/role-form-dialog/role-form-dialog';
import { OrgTreeNode } from '../../components/org-tree-node/org-tree-node';

@Component({
  selector: 'app-organigrama-page',
  standalone: true,
  imports: [CanDirective, Card, ButtonDirective, SkeletonDirective, RoleFormDialog, OrgTreeNode, LucidePlus],
  templateUrl: './organigrama-page.html',
})
export class OrganigramaPage {
  private readonly rolesService = inject(RolesService);

  protected readonly companyId = activeCompanyId();

  protected readonly tree = signal<RoleTreeDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly formDialogOpen = signal(false);

  constructor() {
    if (this.companyId) void this.loadTree();
  }

  protected async loadTree(): Promise<void> {
    if (!this.companyId) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      this.tree.set(await firstValueFrom(this.rolesService.getRoleTree(this.companyId)));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo cargar el organigrama.');
    } finally {
      this.loading.set(false);
    }
  }
}
