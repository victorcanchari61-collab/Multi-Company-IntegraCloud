import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/**
 * Modal sobre el elemento nativo <dialog> (showModal/close, ::backdrop, Esc para cerrar gratis).
 *   <app-dialog [open]="open()" (openChange)="open.set($event)">
 *     <h2 appDialogTitle>Nuevo usuario</h2>
 *     ...
 *   </app-dialog>
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    <dialog
      #dialogEl
      (close)="onNativeClose()"
      (cancel)="onNativeClose()"
      class="w-full max-w-md rounded-xl border border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <ng-content />
    </dialog>
  `,
})
export class Dialog {
  readonly open = input(false);
  readonly openChange = output<boolean>();

  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const el = this.dialogEl().nativeElement;
      if (isOpen && !el.open) el.showModal();
      if (!isOpen && el.open) el.close();
    });
  }

  protected onNativeClose(): void {
    if (this.open()) this.openChange.emit(false);
  }
}
