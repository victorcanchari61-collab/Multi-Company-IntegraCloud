import { Directive } from '@angular/core';

/**
 * Estilo compartido para inputs/textareas/selects nativos (mismo look que login-page).
 *   <input appInput type="email" formControlName="email" />
 *   <select appInput formControlName="estado">...</select>
 */
@Directive({
  selector: 'input[appInput], textarea[appInput], select[appInput]',
  standalone: true,
  host: {
    class:
      'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ' +
      'placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring ' +
      'disabled:cursor-not-allowed disabled:opacity-60',
  },
})
export class InputDirective {}
