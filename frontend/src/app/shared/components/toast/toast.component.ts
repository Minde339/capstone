import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toastService.toasts().length > 0">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [ngClass]="{
          'toast-success': toast.type === 'success',
          'toast-error': toast.type === 'error'
        }"
      >
        <span>{{ toast.text }}</span>
        <button (click)="toastService.remove(toast.id)" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.1rem;">&times;</button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
