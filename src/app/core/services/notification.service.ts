import { Injectable, inject } from '@angular/core';
import { NOTIFICATION_REPOSITORY } from '../tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly repo = inject(NOTIFICATION_REPOSITORY);
  private readonly toasts: { id: string; title: string; body: string }[] = [];
  private toastListeners: ((t: { title: string; body: string }) => void)[] = [];

  notifyUser(
    tripId: string,
    userId: string,
    type: string,
    title: string,
    body: string,
  ): void {
    this.repo.create({ tripId, userId, type, title, body }).subscribe();
    this.showToast(title, body);
  }

  notifyTripMembers(
    tripId: string,
    memberIds: string[],
    type: string,
    title: string,
    body: string,
    excludeUserId?: string,
  ): void {
    for (const userId of memberIds) {
      if (userId === excludeUserId) continue;
      this.notifyUser(tripId, userId, type, title, body);
    }
  }

  showToast(title: string, body: string): void {
    const toast = { id: crypto.randomUUID(), title, body };
    this.toasts.push(toast);
    for (const fn of this.toastListeners) fn({ title, body });
    setTimeout(() => {
      const idx = this.toasts.findIndex((t) => t.id === toast.id);
      if (idx >= 0) this.toasts.splice(idx, 1);
    }, 4000);
  }

  onToast(fn: (t: { title: string; body: string }) => void): () => void {
    this.toastListeners.push(fn);
    return () => {
      this.toastListeners = this.toastListeners.filter((l) => l !== fn);
    };
  }
}
