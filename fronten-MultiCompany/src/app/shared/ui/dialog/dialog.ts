import { Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg';

// En rem, igual a los tope de max-w-sm/md/2xl de Tailwind.
const SIZE_MAX_WIDTH_REM: Record<DialogSize, number> = {
  sm: 24,
  md: 28,
  lg: 42,
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

  // w-full + max-w-[min(...)] (NO margin propio): <dialog>:modal centra vía margin:auto del
  // user-agent. Fijar mx-4 pisaba ese auto y lo pegaba a la izquierda. min(Xrem, 100vw-2rem)
  // dosifica el ancho máximo y deja 1rem de aire a cada lado en pantallas angostas, sin tocar
  // el margin que hace el centrado.
  protected readonly dialogClass = computed(() => {
    const maxWidthRem = SIZE_MAX_WIDTH_REM[this.size()];
    return (
      `w-full max-w-[min(${maxWidthRem}rem,calc(100vw-2rem))] max-h-[85vh] overflow-y-auto rounded-xl border ` +
      `border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/50`
    );
  });

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
