import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideSearch, LucideX } from '@lucide/angular';

/**
 * Buscador reutilizable: lupa a la izquierda y botón de limpiar cuando hay texto.
 * Implementa CVA, se usa igual que un input nativo:
 *   <app-search-input [formControl]="search" placeholder="Buscar…" class="sm:w-64" />
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, LucideX],
  template: `
    <div class="relative">
      <svg lucideSearch class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"></svg>
      <input
        type="search"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="onTouchedFn()"
        class="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-search-cancel-button]:hidden"
      />
      @if (value()) {
        <button
          type="button"
          title="Limpiar búsqueda"
          (click)="clear()"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg lucideX class="size-4"></svg>
        </button>
      }
    </div>
  `,
  host: {
    class: 'block',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchInput),
      multi: true,
    },
  ],
})
export class SearchInput implements ControlValueAccessor {
  readonly placeholder = input<string>('Buscar…');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChangeFn: (value: string) => void = () => {};
  protected onTouchedFn: () => void = () => {};

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

  protected clear(): void {
    this.value.set('');
    this.onChangeFn('');
  }
}
