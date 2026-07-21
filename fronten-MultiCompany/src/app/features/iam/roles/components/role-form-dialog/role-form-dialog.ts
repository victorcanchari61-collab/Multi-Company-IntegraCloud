import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@/app/core/http/api-error';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { Input } from '@/app/shared/ui/input/input';
import { zodFieldValidator } from '@/app/shared/forms/zod-validator';
import { roleFormSchema } from '../../models/role.schema';
import { RolesService } from '../../../shared/services/roles.service';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Dialog, ButtonDirective, Input, InputDirective, LabelDirective],
  templateUrl: './role-form-dialog.html',
})
export class RoleFormDialog {
  readonly open = input(false);
  readonly companyId = input.required<string>();
  readonly roleId = input<string | null>(null);

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);

  protected readonly isEdit = computed(() => this.roleId() !== null);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, zodFieldValidator(roleFormSchema.shape.name)]],
    description: [''],
  });

  constructor() {
    effect(() => {
      if (this.open()) void this.initializeForm();
    });
  }

  private async initializeForm(): Promise<void> {
    const companyId = this.companyId();
    const roleId = this.roleId();

    this.errorMessage.set(null);
    this.form.reset({ name: '', description: '' });

    if (roleId === null) return;

    try {
      const detail = await firstValueFrom(this.rolesService.getRoleById(companyId, roleId));
      this.form.patchValue({ name: detail.name, description: detail.description ?? '' });
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo cargar el rol.');
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    const companyId = this.companyId();
    const roleId = this.roleId();
    const { name, description } = this.form.getRawValue();
    const payload = { name, description: description.trim() || null };

    try {
      if (roleId !== null) await firstValueFrom(this.rolesService.updateRole(companyId, roleId, payload));
      else await firstValueFrom(this.rolesService.createRole(companyId, payload));
      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo guardar el rol.');
    } finally {
      this.saving.set(false);
    }
  }
}
