import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { PermissionsService } from '@/app/core/auth/permissions.service';

/**
 * Renderiza el contenido solo si el usuario tiene el permiso indicado (equivalente a <Can> en React).
 *   <button *appCan="'iam.users.create'" appButton>Nuevo usuario</button>
 */
@Directive({
  selector: '[appCan]',
  standalone: true,
})
export class CanDirective {
  readonly appCan = input.required<string>();

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissions = inject(PermissionsService);

  private inserted = false;

  constructor() {
    effect(() => {
      const allowed = this.permissions.can(this.appCan());
      if (allowed && !this.inserted) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.inserted = true;
      } else if (!allowed && this.inserted) {
        this.viewContainer.clear();
        this.inserted = false;
      }
    });
  }
}
