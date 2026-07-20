import { Component, input } from '@angular/core';
import {
  LucideBoxes,
  LucideBuilding2,
  LucideFolder,
  LucideKeyRound,
  LucideLayoutDashboard,
  LucidePackage,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideUserCheck,
  LucideUsers,
} from '@lucide/angular';

export type SidebarIconKey =
  | 'dashboard'
  | 'shield-check'
  | 'boxes'
  | 'shopping-cart'
  | 'package'
  | 'user-check'
  | 'users'
  | 'key-round'
  | 'building2'
  | 'folder';

@Component({
  selector: 'app-sidebar-icon',
  standalone: true,
  imports: [
    LucideLayoutDashboard,
    LucideShieldCheck,
    LucideBoxes,
    LucideShoppingCart,
    LucidePackage,
    LucideUserCheck,
    LucideUsers,
    LucideKeyRound,
    LucideBuilding2,
    LucideFolder,
  ],
  template: `
    @switch (icon()) {
      @case ('dashboard') {
        <svg lucideLayoutDashboard class="size-full"></svg>
      }
      @case ('shield-check') {
        <svg lucideShieldCheck class="size-full"></svg>
      }
      @case ('boxes') {
        <svg lucideBoxes class="size-full"></svg>
      }
      @case ('shopping-cart') {
        <svg lucideShoppingCart class="size-full"></svg>
      }
      @case ('package') {
        <svg lucidePackage class="size-full"></svg>
      }
      @case ('user-check') {
        <svg lucideUserCheck class="size-full"></svg>
      }
      @case ('users') {
        <svg lucideUsers class="size-full"></svg>
      }
      @case ('key-round') {
        <svg lucideKeyRound class="size-full"></svg>
      }
      @case ('building2') {
        <svg lucideBuilding2 class="size-full"></svg>
      }
      @default {
        <svg lucideFolder class="size-full"></svg>
      }
    }
  `,
  host: {
    class: 'inline-flex',
  },
})
export class SidebarIcon {
  readonly icon = input.required<SidebarIconKey>();
}
