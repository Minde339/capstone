import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(text: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, text };
    this.toasts.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  error(text: string) {
    this.show(text, 'error');
  }

  info(text: string) {
    this.show(text, 'info');
  }

  remove(id: string) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
