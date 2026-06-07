import type { Observable } from 'rxjs';
import type { Activity, AuditLogEntry } from '../../core/models';

export type ActivityInput = Omit<Activity, 'id' | 'createdAt' | 'auditLog'>;

export interface ActivityRepository {
  list(tripId: string): Observable<Activity[]>;
  getById(id: string): Observable<Activity | undefined>;
  create(input: ActivityInput, audit?: Omit<AuditLogEntry, 'id' | 'timestamp'>): Observable<Activity>;
  update(
    id: string,
    patch: Partial<Activity>,
    audit?: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Observable<Activity>;
  move(
    id: string,
    date: string,
    startTime: string,
    endTime: string | undefined,
    audit: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Observable<Activity>;
  delete(id: string, audit?: Omit<AuditLogEntry, 'id' | 'timestamp'>): Observable<void>;
}
