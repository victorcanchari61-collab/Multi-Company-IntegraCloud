import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { ZodType } from 'zod';

/**
 * Adapta un schema de Zod a un ValidatorFn de Reactive Forms para un control individual.
 * Deja pasar valores vacíos: combínalo con Validators.required si el campo es obligatorio.
 *   Validators.compose([Validators.required, zodFieldValidator(schema.shape.email)])
 */
export function zodFieldValidator(schema: ZodType): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '' || control.value === null || control.value === undefined) return null;

    const result = schema.safeParse(control.value);
    if (result.success) return null;

    return { zod: result.error.issues[0]?.message ?? 'Valor inválido' };
  };
}
