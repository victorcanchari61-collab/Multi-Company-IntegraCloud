import { Component, ElementRef, computed, effect, input, output, viewChild } from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg';

// Strings completos y literales (no armados con interpolación): Tailwind solo genera CSS para
// nombres de clase que aparecen enteros en el código fuente. Antes esto era
// `max-w-[min(${rem}rem,...)]`, una clase armada con una variable — Tailwind nunca la "veía" y
// no generaba su CSS, por eso el modal perdía el tope de ancho y se estiraba a pantalla completa.
const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: 'max-w-[min(24rem,calc(100vw-2rem))]',
  md: 'max-w-[min(28rem,calc(100vw-2rem))]',
  lg: 'max-w-[min(42rem,calc(100vw-2rem))]',
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

  // El centrado nativo de <dialog> vía margin:auto depende del user-agent y no es confiable
  // (en la práctica centraba vertical pero dejaba el diálogo pegado a la izquierda). Se fija la
  // posición explícitamente con top/left 50% + translate, la técnica estándar para centrar un
  // elemento fixed sin depender de ningún comportamiento implícito del navegador. bottom-auto/
  // right-auto/m-0 anulan el inset-block y el margin que pone el UA stylesheet de dialog:modal.
  protected readonly dialogClass = computed(
    () =>
      `fixed top-1/2 left-1/2 right-auto bottom-auto m-0 -translate-x-1/2 -translate-y-1/2 ` +
      `w-full ${SIZE_CLASSES[this.size()]} max-h-[85vh] overflow-y-auto rounded-xl border ` +
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
