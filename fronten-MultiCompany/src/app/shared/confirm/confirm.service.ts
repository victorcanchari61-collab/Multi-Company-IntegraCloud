import { Injectable, signal } from '@angular/core';

interface ConfirmRequest {
  title?: string;
  message: string;
  resolve: (result: boolean) => void;
}

/**
 * Confirmación tipo "¿seguro?" sin montar un dialog manualmente en cada llamador
 * (equivalente a useConfirm() en React). El componente <app-confirm-dialog/> se monta
 * una sola vez en la raíz de la app y reacciona a `request`.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  confirm(message: string, title?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.request.set({ message, title, resolve });
    });
  }

  respond(result: boolean): void {
    this.request()?.resolve(result);
    this.request.set(null);
  }
}
