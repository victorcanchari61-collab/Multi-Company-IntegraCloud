import { Directive } from '@angular/core';

/** Placeholder de carga tipo shimmer. Uso: <div appSkeleton class="h-4 w-32"></div> */
@Directive({
  selector: '[appSkeleton]',
  standalone: true,
  host: {
    class: 'animate-pulse rounded-md bg-muted',
  },
})
export class SkeletonDirective {}
