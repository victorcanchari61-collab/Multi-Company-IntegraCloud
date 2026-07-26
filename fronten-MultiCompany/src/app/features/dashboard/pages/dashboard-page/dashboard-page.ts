import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LucideBadgeCheck,
  LucideClipboardList,
  LucideHandshake,
  LucideIdCard,
  LucideLayoutGrid,
  LucideNetwork,
  LucideRecycle,
  LucideShoppingCart,
  LucideTruck,
  LucideWarehouse,
  LucideWrench,
} from '@lucide/angular';
import { SYSTEMS } from '@/app/core/constants/systems';
import { AuthState } from '@/app/core/state/auth.state';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideLayoutGrid,
    LucideHandshake,
    LucideWarehouse,
    LucideNetwork,
    LucideClipboardList,
    LucideTruck,
    LucideIdCard,
    LucideShoppingCart,
    LucideRecycle,
    LucideBadgeCheck,
    LucideWrench,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly authState = inject(AuthState);
  protected readonly systems = SYSTEMS;
}
