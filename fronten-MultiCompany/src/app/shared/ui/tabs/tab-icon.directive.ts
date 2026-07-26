import { Directive, TemplateRef, input } from '@angular/core';

/**
 * Marca un <ng-template> como el ícono de una pestaña de <app-tabs>, por key.
 *   <ng-template appTabIcon="productos"><svg lucideBox class="size-4"></svg></ng-template>
 */
@Directive({
  selector: 'ng-template[appTabIcon]',
  standalone: true,
})
export class TabIcon {
  readonly appTabIcon = input.required<string>();

  constructor(readonly templateRef: TemplateRef<unknown>) {}
}
