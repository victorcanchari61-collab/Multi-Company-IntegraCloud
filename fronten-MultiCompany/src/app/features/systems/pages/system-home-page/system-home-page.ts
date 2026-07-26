import { ChangeDetectionStrategy, Component, type Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { SYSTEMS } from '@/app/core/constants/systems';
import { Card } from '@/app/shared/ui/card/card';

/**
 * Página de aterrizaje genérica de un sistema (/erp, /crm, /wms, ...). El Shell detecta el
 * sistema por la URL y monta su sidebar propio; esta página solo presenta el sistema mientras
 * sus módulos se construyen. Cuando un sistema tenga página real propia, se registra su ruta
 * específica antes de la ruta genérica ':system' (como ya hace /iam).
 */
@Component({
  selector: 'app-system-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card],
  template: `
    @if (system(); as sys) {
      <div class="space-y-4">
        <app-card>
          <h1 class="text-xl font-bold text-foreground">{{ sys.acronym }}</h1>
          <p class="mt-2 text-sm text-muted-foreground">{{ sys.description }}</p>
        </app-card>
        <app-card>
          <p class="text-sm text-muted-foreground">
            Este sistema está en construcción. Los módulos que tu empresa tenga habilitados aparecerán en la barra
            lateral izquierda.
          </p>
        </app-card>
      </div>
    }
  `,
})
export class SystemHomePage {
  private readonly route = inject(ActivatedRoute);

  private readonly systemKey: Signal<string>;
  protected readonly system = computed(() => SYSTEMS.find((s) => s.key === this.systemKey()) ?? null);

  constructor() {
    // Asignado en el constructor (no como inicializador de campo) para garantizar el contexto
    // de inyección de toSignal — misma lección que currentUrl en Shell (NG0203).
    this.systemKey = toSignal(this.route.paramMap.pipe(map((params) => params.get('system') ?? '')), {
      initialValue: this.route.snapshot.paramMap.get('system') ?? '',
    });
  }
}
