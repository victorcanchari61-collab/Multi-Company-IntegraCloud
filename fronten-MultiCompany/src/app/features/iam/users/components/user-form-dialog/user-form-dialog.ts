import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@/app/core/http/api-error';
import { AuthState } from '@/app/core/state/auth.state';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { CheckboxDirective } from '@/app/shared/ui/directives/checkbox.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { Input } from '@/app/shared/ui/input/input';
import { zodFieldValidator } from '@/app/shared/forms/zod-validator';
import type { Role } from '../../../shared/models/iam.model';
import { RolesService } from '../../../shared/services/roles.service';
import { userFormSchema } from '../../models/user.schema';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Dialog, ButtonDirective, Input, LabelDirective, CheckboxDirective],
  templateUrl: './user-form-dialog.html',
})
export class UserFormDialog {
  readonly open = input(false);
  readonly companyId = input.required<string>();
  readonly userId = input<string | null>(null);

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly authState = inject(AuthState);

  protected readonly isEdit = computed(() => this.userId() !== null);
  protected readonly roles = signal<Role[]>([]);
  protected readonly selectedRoleIds = signal<Set<string>>(new Set());
  protected readonly rolesReady = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, zodFieldValidator(userFormSchema.shape.fullName)]],
    email: ['', [Validators.required, zodFieldValidator(userFormSchema.shape.email)]],
    password: [''],
  });

  constructor() {
    effect(() => {
      if (this.open()) void this.initializeForm();
    });
  }

  private async initializeForm(): Promise<void> {
    const companyId = this.companyId();
    const userId = this.userId();
    const editing = userId !== null;

    this.errorMessage.set(null);
    this.rolesReady.set(false);
    this.form.reset({ fullName: '', email: '', password: '' });
    this.selectedRoleIds.set(new Set());

    if (editing) {
      this.form.controls.password.clearValidators();
    } else {
      this.form.controls.password.setValidators([Validators.required, zodFieldValidator(userFormSchema.shape.password)]);
    }
    this.form.controls.password.updateValueAndValidity();

    try {
      const [roles, detail] = await Promise.all([
        firstValueFrom(this.rolesService.getRoles(companyId)),
        editing ? firstValueFrom(this.usersService.getUserById(companyId, userId)) : Promise.resolve(null),
      ]);
      this.roles.set(roles);
      if (detail) {
        this.form.patchValue({ fullName: detail.fullName, email: detail.email });
        this.selectedRoleIds.set(new Set(detail.roles.map((r) => r.roleId)));
      }
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los datos.');
    } finally {
      this.rolesReady.set(true);
    }
  }

  protected toggleRole(roleId: string, checked: boolean): void {
    const next = new Set(this.selectedRoleIds());
    if (checked) next.add(roleId);
    else next.delete(roleId);
    this.selectedRoleIds.set(next);
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.rolesReady()) {
      this.form.markAllAsTouched();
      return;
    }

    const companyId = this.companyId();
    const userId = this.userId();
    const { fullName, email, password } = this.form.getRawValue();
    const roleIds = Array.from(this.selectedRoleIds());

    // El backend REEMPLAZA el set completo de roles (lista vacía = usuario sin ningún rol) y no
    // tiene guarda de "último admin". Bloquear acá evita que un admin se quite sus propios roles
    // por accidente y deje a toda la empresa sin acceso (ya pasó en pruebas).
    if (userId !== null && userId === this.authState.user()?.id && roleIds.length === 0) {
      this.errorMessage.set('No puedes quitarte todos tus propios roles: perderías el acceso a la administración.');
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    try {
      if (userId !== null) {
        await firstValueFrom(this.usersService.updateUser(companyId, userId, { fullName, email }));
        await firstValueFrom(this.usersService.assignRolesToUser(companyId, userId, roleIds));
      } else {
        const newUserId = await firstValueFrom(this.usersService.createUser(companyId, { fullName, email, password }));
        if (roleIds.length) await firstValueFrom(this.usersService.assignRolesToUser(companyId, newUserId, roleIds));
      }
      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo guardar el usuario.');
    } finally {
      this.saving.set(false);
    }
  }
}
