import type { Observable } from 'rxjs';
import type { AppNotification } from '../../core/models';

export interface CreateNotificationInput {
  tripId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
}

export interface NotificationRepository {
  listForUser(userId: string, tripId?: string): Observable<AppNotification[]>;
  create(input: CreateNotificationInput): Observable<AppNotification>;
  markRead(id: string): Observable<void>;
  markAllRead(userId: string, tripId: string): Observable<void>;
}
