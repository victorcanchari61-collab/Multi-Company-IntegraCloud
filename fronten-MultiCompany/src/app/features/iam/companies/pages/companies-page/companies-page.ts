import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import type { ColumnDef } from '@tanstack/angular-table';
import { LucideBan, LucidePencil, LucideRotateCcw } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { CanDirective } from '@/app/shared/directives/can.directive';
import { ConfirmService } from '@/app/shared/confirm/confirm.service';
import { Badge } from '@/app/shared/ui/badge/badge';
import { DataTable } from '@/app/shared/ui/data-table/data-table';
import { DataTableCell, DataTableMobileTitle } from '@/app/shared/ui/data-table/data-table-cell.directive';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { ENTITY_STATUS } from '../../../shared/models/iam.model';
import { CompanyFormDialog } from '../../components/company-form-dialog/company-form-dialog';
import type { Company } from '../../models/company.model';
import { CompaniesService } from '../../services/companies.service';

const COLUMNS: ColumnDef<Company, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Empresa' },
  { id: 'slug', accessorKey: 'slug', header: 'Slug', size: 120 },
  { id: 'taxId', accessorKey: 'taxId', header: 'RUC', size: 120 },
  { id: 'status', accessorKey: 'status', header: 'Estado', size: 110 },
  { id: 'actions', header: 'Acciones', size: 100, enableSorting: false, enableColumnFilter: false },
];

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CanDirective,
    Badge,
    DataTable,
    DataTableCell,
    DataTableMobileTitle,
    ButtonDirective,
    InputDirective,
    CompanyFormDialog,
    LucidePencil,
    LucideBan,
    LucideRotateCcw,
  ],
  templateUrl: './companies-page.html',
})
export class CompaniesPage {
  private readonly companiesService = inject(CompaniesService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly ENTITY_STATUS = ENTITY_STATUS;
  protected readonly columns = COLUMNS;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly companies = signal<Company[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly formDialogOpen = signal(false);
  protected readonly editingCompanyId = signal<string | null>(null);

  constructor() {
    void this.loadCompanies();

    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => void this.loadCompanies());
  }

  protected async loadCompanies(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const result = await firstValueFrom(
        this.companiesService.getCompanies({ page: 1, size: 50, search: this.search.value || undefined }),
      );
      this.companies.set(result.items);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar las empresas.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openCreateDialog(): void {
    this.editingCompanyId.set(null);
    this.formDialogOpen.set(true);
  }

  protected openEditDialog(company: Company): void {
    this.editingCompanyId.set(company.id);
    this.formDialogOpen.set(true);
  }

  protected async toggleStatus(company: Company): Promise<void> {
    const isActive = company.status === ENTITY_STATUS.ACTIVE;
    const confirmed = await this.confirmService.confirm(
      isActive
        ? `¿Suspender a ${company.name}? Sus usuarios no podrán iniciar sesión hasta que se reactive.`
        : `¿Reactivar a ${company.name}?`,
      isActive ? 'Suspender empresa' : 'Reactivar empresa',
    );
    if (!confirmed) return;

    try {
      if (isActive) await firstValueFrom(this.companiesService.suspendCompany(company.id));
      else await firstValueFrom(this.companiesService.activateCompany(company.id));
      await this.loadCompanies();
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo actualizar el estado.');
    }
  }
}
