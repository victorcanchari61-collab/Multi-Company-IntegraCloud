import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content />`,
  host: {
    class: 'block rounded-xl border border-border bg-card p-6 shadow-sm',
  },
})
export class Card {}
