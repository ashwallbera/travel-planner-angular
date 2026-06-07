import { Component, inject, OnDestroy, signal } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.scss',
})
export class NotificationToast implements OnDestroy {
  private readonly notifications = inject(NotificationService);
  private unsubscribe?: () => void;

  readonly toast = signal<{ title: string; body: string } | null>(null);

  constructor() {
    this.unsubscribe = this.notifications.onToast((t) => {
      this.toast.set(t);
      setTimeout(() => this.toast.set(null), 3800);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
  }
}
