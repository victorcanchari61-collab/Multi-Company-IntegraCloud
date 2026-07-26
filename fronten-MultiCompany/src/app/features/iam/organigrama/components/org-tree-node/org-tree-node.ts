import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import type { RoleTreeDto } from '../../../shared/models/iam.model';

interface ConnectorLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Separación vertical entre el borde inferior del nodo padre y la línea horizontal que
// reparte hacia los hijos. Los hijos van con mt-14 (56px), así queda a ~3/4 del tramo.
const VERTICAL_GAP = 40;

/**
 * Nodo recursivo del organigrama: dibuja el rol, y si tiene hijos, un SVG absoluto con las
 * líneas conectoras (medidas del DOM real con ResizeObserver, igual que el OrgChart de React)
 * y un <app-org-tree-node> por cada hijo.
 */
@Component({
  selector: 'app-org-tree-node',
  standalone: true,
  template: `
    <div #container class="relative flex flex-col items-center">
      <div>
        <div data-org-node [class]="nodeClass()">
          <span class="whitespace-nowrap">{{ role().name }}</span>
        </div>
      </div>

      @if (role().children.length > 0) {
        <svg class="pointer-events-none absolute left-0 top-0 z-0 size-full">
          @for (line of lines(); track $index) {
            <line
              [attr.x1]="line.x1"
              [attr.y1]="line.y1"
              [attr.x2]="line.x2"
              [attr.y2]="line.y2"
              stroke="#d97706"
              stroke-width="2"
              stroke-linecap="round"
            />
          }
        </svg>

        <div #childrenContainer class="z-[1] mt-14 flex justify-center gap-8">
          @for (child of role().children; track child.id) {
            <app-org-tree-node [role]="child" />
          }
        </div>
      }
    </div>
  `,
})
export class OrgTreeNode {
  readonly role = input.required<RoleTreeDto>();

  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('container');
  private readonly childrenContainer = viewChild<ElementRef<HTMLDivElement>>('childrenContainer');
  private readonly destroyRef = inject(DestroyRef);

  protected readonly lines = signal<ConnectorLine[]>([]);

  // Raíz (sin padre) = nodo destacado en ámbar sólido; el resto en blanco con borde ámbar.
  protected readonly nodeClass = computed(() => {
    const base =
      'relative flex min-w-[140px] flex-col items-center justify-center rounded-lg border-2 px-5 py-3 ' +
      'text-center text-xs font-bold uppercase tracking-wider transition-all hover:shadow-lg';
    return this.role().parentRoleId === null
      ? `${base} border-amber-500 bg-amber-500 text-white`
      : `${base} border-amber-600/40 bg-card text-blue-900`;
  });

  constructor() {
    // afterNextRender solo corre en el navegador: seguro con SSR (ResizeObserver no existe en servidor).
    afterNextRender(() => {
      this.updateLines();
      const observer = new ResizeObserver(() => this.updateLines());
      observer.observe(this.container().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private updateLines(): void {
    const childrenEl = this.childrenContainer()?.nativeElement;
    if (!childrenEl || this.role().children.length === 0) {
      this.lines.set([]);
      return;
    }

    const containerEl = this.container().nativeElement;
    const parentNode = containerEl.querySelector<HTMLElement>('[data-org-node]');
    if (!parentNode) return;

    const containerRect = containerEl.getBoundingClientRect();
    const parentRect = parentNode.getBoundingClientRect();
    const parentBottomX = parentRect.left - containerRect.left + parentRect.width / 2;
    const parentBottomY = parentRect.bottom - containerRect.top;

    // Solo los nodos raíz de cada subárbol hijo directo (no los nietos): se toma el primer
    // [data-org-node] dentro de cada <app-org-tree-node> hijo inmediato.
    const childCenters: { x: number; y: number }[] = [];
    for (const childHost of Array.from(childrenEl.children)) {
      const node = childHost.querySelector<HTMLElement>('[data-org-node]');
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      childCenters.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
      });
    }
    if (childCenters.length === 0) {
      this.lines.set([]);
      return;
    }

    const midY = parentBottomY + VERTICAL_GAP;
    const newLines: ConnectorLine[] = [{ x1: parentBottomX, y1: parentBottomY, x2: parentBottomX, y2: midY }];

    if (childCenters.length === 1) {
      newLines.push({ x1: parentBottomX, y1: midY, x2: childCenters[0].x, y2: midY });
    } else {
      const minX = Math.min(...childCenters.map((c) => c.x));
      const maxX = Math.max(...childCenters.map((c) => c.x));
      newLines.push({ x1: minX, y1: midY, x2: maxX, y2: midY });
    }

    for (const child of childCenters) {
      newLines.push({ x1: child.x, y1: midY, x2: child.x, y2: child.y });
    }

    this.lines.set(newLines);
  }
}
