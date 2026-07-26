import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChildren, input, output } from '@angular/core';
import { TabIcon } from './tab-icon.directive';

export interface TabItem {
  key: string;
  label: string;
}

/**
 * Barra de pestañas tipo píldora, reutilizable en cualquier vista (hubs, dialogs, páginas).
 * Los íconos se proyectan por key con ng-template, así cada vista importa solo los suyos:
 *   <app-tabs [items]="tabs" [activeKey]="active()" (activeKeyChange)="active.set($event)">
 *     <ng-template appTabIcon="productos"><svg lucideBox class="size-4"></svg></ng-template>
 *   </app-tabs>
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
      @for (tab of items(); track tab.key) {
        <button type="button" [class]="tabClass(tab.key)" (click)="activeKeyChange.emit(tab.key)">
          <ng-container *ngTemplateOutlet="iconTemplates().get(tab.key) ?? null" />
          <span class="whitespace-nowrap">{{ tab.label }}</span>
        </button>
      }
    </div>
  `,
})
export class Tabs {
  readonly items = input.required<TabItem[]>();
  readonly activeKey = input.required<string>();
  readonly activeKeyChange = output<string>();

  private readonly icons = contentChildren(TabIcon);

  protected readonly iconTemplates = computed(() => {
    const map = new Map<string, TabIcon['templateRef']>();
    for (const icon of this.icons()) map.set(icon.appTabIcon(), icon.templateRef);
    return map;
  });

  protected tabClass(key: string): string {
    const base =
      'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors';
    return this.activeKey() === key
      ? `${base} bg-primary/10 font-medium text-primary`
      : `${base} text-muted-foreground hover:text-foreground`;
  }
}
