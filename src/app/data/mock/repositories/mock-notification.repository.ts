import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { AppNotification } from '../../../core/models';
import type {
  CreateNotificationInput,
  NotificationRepository,
} from '../../repositories/notification.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockNotificationRepository implements NotificationRepository {
  private readonly store = inject(InMemoryStore);

  listForUser(userId: string, tripId?: string): Observable<AppNotification[]> {
    return this.store.data$.pipe(
      map((d) =>
        d.notifications
          .filter((n) => n.userId === userId && (!tripId || n.tripId === tripId))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    );
  }

  create(input: CreateNotificationInput): Observable<AppNotification> {
    const notification: AppNotification = {
      id: newId(),
      ...input,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => d.notifications.push(notification));
    return of(notification).pipe(switchMap((n) => delay(n)));
  }

  markRead(id: string): Observable<void> {
    this.store.update((d) => {
      const n = d.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  markAllRead(userId: string, tripId: string): Observable<void> {
    this.store.update((d) => {
      d.notifications
        .filter((n) => n.userId === userId && n.tripId === tripId)
        .forEach((n) => (n.read = true));
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
