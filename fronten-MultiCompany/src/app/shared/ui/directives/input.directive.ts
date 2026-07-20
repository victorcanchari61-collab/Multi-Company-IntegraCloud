import { Directive } from '@angular/core';

/**
 * Estilo compartido para inputs/textareas nativos (mismo look que login-page).
 *   <input appInput type="email" formControlName="email" />
 */
@Directive({
  selector: 'input[appInput], textarea[appInput]',
  standalone: true,
  host: {
    class:
      'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ' +
      'placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring ' +
      'disabled:cursor-not-allowed disabled:opacity-60',
  },
})
export class InputDirective {}
