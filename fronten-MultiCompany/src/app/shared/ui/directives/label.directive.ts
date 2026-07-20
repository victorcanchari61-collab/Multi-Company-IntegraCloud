import { Directive } from '@angular/core';

/** Estilo compartido para <label>. Uso: <label appLabel for="email">Correo</label> */
@Directive({
  selector: 'label[appLabel]',
  standalone: true,
  host: {
    class: 'mb-1.5 block text-sm font-medium text-foreground',
  },
})
export class LabelDirective {}
