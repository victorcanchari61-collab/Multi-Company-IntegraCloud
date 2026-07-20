import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@/app/core/http/api-error';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { Input } from '@/app/shared/ui/input/input';
import { zodFieldValidator } from '@/app/shared/forms/zod-validator';
import { changePasswordSchema } from '../../models/user.schema';
import { UsersService } from '../../services/users.service';

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
  };
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Dialog, ButtonDirective, Input, LabelDirective],
  templateUrl: './change-password-dialog.html',
})
export class ChangePasswordDialog {
  readonly open = input(false);
  readonly companyId = input.required<string>();
  readonly userId = input<string | null>(null);

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, zodFieldValidator(changePasswordSchema.shape.newPassword)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator() },
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        this.errorMessage.set(null);
        this.form.reset({ newPassword: '', confirmPassword: '' });
      }
    });
  }

  protected async onSubmit(): Promise<void> {
    const userId = this.userId();
    if (this.form.invalid || userId === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    try {
      const { newPassword } = this.form.getRawValue();
      await firstValueFrom(
        this.usersService.changePassword(this.companyId(), userId, { currentPassword: '', newPassword }),
      );
      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo cambiar la contraseña.');
    } finally {
      this.saving.set(false);
    }
  }
}
