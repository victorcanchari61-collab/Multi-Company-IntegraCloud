import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'destructive' | 'outline';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border border-input text-foreground',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class Badge {
  readonly variant = input<BadgeVariant>('default');

  protected readonly classes = computed(
    () =>
      `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[this.variant()]}`,
  );
}
