import { Directive, TemplateRef, input } from '@angular/core';

/**
 * Marca un <ng-template> como el renderer de una columna del DataTable, por id de columna.
 *   <ng-template appCell="status" let-row>...</ng-template>
 */
@Directive({
  selector: 'ng-template[appCell]',
  standalone: true,
})
export class DataTableCell {
  readonly appCell = input.required<string>();

  constructor(readonly templateRef: TemplateRef<{ $implicit: unknown }>) {}
}

/** <ng-template appMobileTitle let-row>...</ng-template> — encabezado de la tarjeta en mobile. */
@Directive({
  selector: 'ng-template[appMobileTitle]',
  standalone: true,
})
export class DataTableMobileTitle {
  constructor(readonly templateRef: TemplateRef<{ $implicit: unknown }>) {}
}
