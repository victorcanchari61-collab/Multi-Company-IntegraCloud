import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideX } from '@lucide/angular';

export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'number' | 'date';
export type InputSize = 'default' | 'lg';

const SIZE_CLASSES: Record<InputSize, string> = {
  default: '',
  lg: 'h-11',
};

/**
 * Input reutilizable con ícono de estado embebido: check cuando tiene valor, X cuando es
 * obligatorio y todavía está vacío (tras el primer blur). Reemplaza a appInput en formularios.
 *   <app-input id="email" type="email" formControlName="email" [required]="true" />
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [LucideCheck, LucideX],
  template: `
    <div class="relative">
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [autocomplete]="autocomplete()"
        [attr.maxlength]="maxLength()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [class]="inputClass()"
      />
      @if (showFilled()) {
        <svg
          lucideCheck
          class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-success"
          [strokeWidth]="2.5"
        ></svg>
      } @else if (showMissing()) {
        <svg
          lucideX
          class="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-destructive"
          [strokeWidth]="2.5"
        ></svg>
      }
    </div>
  `,
  host: {
    class: 'block',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
})
export class Input implements ControlValueAccessor {
  readonly id = input<string>('');
  readonly type = input<InputType>('text');
  readonly size = input<InputSize>('default');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly required = input(false);
  readonly maxLength = input<number | null>(null);

  protected readonly value = signal('');
  protected readonly touched = signal(false);
  protected readonly disabled = signal(false);

  protected readonly inputClass = computed(
    () =>
      `w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground ` +
      `placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring ` +
      `disabled:cursor-not-allowed disabled:opacity-60 ${SIZE_CLASSES[this.size()]}`,
  );

  protected readonly showFilled = computed(() => this.value().trim().length > 0);
  protected readonly showMissing = computed(
    () => this.required() && this.touched() && this.value().trim().length === 0,
  );

  private onChangeFn: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChangeFn(value);
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.onTouchedFn();
  }
}
