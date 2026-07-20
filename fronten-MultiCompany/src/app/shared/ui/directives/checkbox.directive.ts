import { Directive } from '@angular/core';

/** Estilo compartido para checkboxes nativos. Uso: <input type="checkbox" appCheckbox /> */
@Directive({
  selector: 'input[type=checkbox][appCheckbox]',
  standalone: true,
  host: {
    class: 'size-4 rounded border-input text-primary focus:ring-ring',
  },
})
export class CheckboxDirective {}
