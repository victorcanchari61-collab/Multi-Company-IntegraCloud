import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { LucideFilter } from '@lucide/angular';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';

/**
 * Botón de filtros con contador de filtros activos y panel desplegable. Los campos del filtro
 * se proyectan desde la vista (cada página define los suyos); este componente solo aporta el
 * marco: botón + badge, encabezado con "Resetear", y el botón "Aplicar filtros".
 *   <app-filter-popover [count]="activeFilterCount()" (reset)="resetFilters()" (apply)="applyFilters()">
 *     <div>...campos...</div>
 *   </app-filter-popover>
 */
@Component({
  selector: 'app-filter-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, LucideFilter],
  template: `
    <div class="relative inline-block">
      <button
        appButton
        variant="outline"
        size="icon"
        type="button"
        title="Filtros"
        (click)="open.set(!open())"
      >
        <svg lucideFilter class="size-4"></svg>
      </button>
      @if (count() > 0) {
        <span
          class="pointer-events-none absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
        >
          {{ count() }}
        </span>
      }

      @if (open()) {
        <div class="fixed inset-0 z-40" (click)="open.set(false)"></div>
        <div
          class="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 text-left shadow-xl"
        >
          <div class="mb-3 flex items-center justify-between gap-4">
            <p class="text-sm font-bold text-foreground">Filtros</p>
            <button
              type="button"
              class="text-xs font-medium text-destructive hover:underline"
              (click)="reset.emit()"
            >
              Resetear los filtros
            </button>
          </div>

          <div class="space-y-3">
            <ng-content />
          </div>

          <button appButton variant="primary" size="sm" type="button" class="mt-4 w-full" (click)="onApply()">
            Aplicar filtros
          </button>
        </div>
      }
    </div>
  `,
})
export class FilterPopover {
  readonly count = input(0);
  readonly reset = output<void>();
  readonly apply = output<void>();

  protected readonly open = signal(false);

  protected onApply(): void {
    this.apply.emit();
    this.open.set(false);
  }
}
