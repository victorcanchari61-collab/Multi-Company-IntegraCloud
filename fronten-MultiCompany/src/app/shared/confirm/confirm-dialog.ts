import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, ButtonDirective],
  template: `
    <app-dialog [open]="!!confirmService.request()" (openChange)="onOpenChange($event)">
      @if (confirmService.request(); as req) {
        <h2 class="mb-2 text-lg font-bold text-foreground">{{ req.title ?? 'Confirmar' }}</h2>
        <p class="mb-6 text-sm text-muted-foreground">{{ req.message }}</p>
        <div class="flex justify-end gap-2">
          <button appButton variant="outline" type="button" (click)="respond(false)">Cancelar</button>
          <button appButton variant="destructive" type="button" (click)="respond(true)">Confirmar</button>
        </div>
      }
    </app-dialog>
  `,
})
export class ConfirmDialog {
  protected readonly confirmService = inject(ConfirmService);

  protected respond(result: boolean): void {
    this.confirmService.respond(result);
  }

  protected onOpenChange(open: boolean): void {
    if (!open) this.confirmService.respond(false);
  }
}
