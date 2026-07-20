import { Directive, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'destructive' | 'ghost';
export type ButtonSize = 'default' | 'sm' | 'icon';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-input bg-background text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  ghost: 'text-foreground hover:bg-muted',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: 'h-11 px-4 text-sm',
  sm: 'h-8 px-3 text-xs',
  icon: 'size-9',
};

/**
 * Estilo compartido para botones nativos.
 *   <button appButton variant="primary" size="default" type="submit">Guardar</button>
 */
@Directive({
  selector: 'button[appButton]',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
})
export class ButtonDirective {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('default');

  protected readonly classes = computed(
    () => `${BASE} ${VARIANT_CLASSES[this.variant()]} ${SIZE_CLASSES[this.size()]}`,
  );
}
