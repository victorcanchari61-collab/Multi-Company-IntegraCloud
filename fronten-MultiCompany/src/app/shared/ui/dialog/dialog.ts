import { Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

/**
 * Modal sobre el elemento nativo <dialog> (showModal/close, ::backdrop, Esc para cerrar gratis).
 *   <app-dialog [open]="open()" (openChange)="open.set($event)" size="lg">
 *     <h2>Nueva empresa</h2>
 *     ...
 *   </app-dialog>
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    <dialog #dialogEl (close)="onNativeClose()" (cancel)="onNativeClose()" [class]="dialogClass()">
      <ng-content />
    </dialog>
  `,
})
export class Dialog {
  readonly open = input(false);
  readonly size = input<DialogSize>('md');
  readonly openChange = output<boolean>();

  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  // mx-4 + w-[calc(100%-2rem)] en vez de w-full: dejan el mismo aire (1rem) a cada lado en
  // cualquier ancho de pantalla, sin depender del auto-centrado del navegador para <dialog>.
  protected readonly dialogClass = computed(
    () =>
      `mx-4 w-[calc(100%-2rem)] ${SIZE_CLASSES[this.size()]} max-h-[85vh] overflow-y-auto rounded-xl border ` +
      `border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/50`,
  );

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
