import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { Activity, AuditLogEntry } from '../../../core/models';
import { AuditTrailService } from '../../../core/services/audit-trail.service';
import type { ActivityInput, ActivityRepository } from '../../repositories/activity.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockActivityRepository implements ActivityRepository {
  private readonly store = inject(InMemoryStore);
  private readonly audit = inject(AuditTrailService);

  list(tripId: string): Observable<Activity[]> {
    return this.store.data$.pipe(
      map((d) => d.activities.filter((a) => a.tripId === tripId)),
    );
  }

  getById(id: string): Observable<Activity | undefined> {
    return this.store.data$.pipe(map((d) => d.activities.find((a) => a.id === id)));
  }

  create(
    input: ActivityInput,
    auditEntry?: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Observable<Activity> {
    const log = auditEntry
      ? [this.audit.toEntry(auditEntry)]
      : [
          this.audit.toEntry(
            this.audit.buildEntry(input.addedBy, input.addedByName, 'Created activity'),
          ),
        ];
    const activity: Activity = {
      ...input,
      id: newId(),
      auditLog: log,
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => d.activities.push(activity));
    return of(activity).pipe(switchMap((a) => delay(a)));
  }

  update(
    id: string,
    patch: Partial<Activity>,
    auditEntry?: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Observable<Activity> {
    let updated!: Activity;
    this.store.update((d) => {
      const idx = d.activities.findIndex((a) => a.id === id);
      if (idx >= 0) {
        const before = d.activities[idx];
        const lines = this.audit.diffFields(
          before as unknown as Record<string, unknown>,
          patch as Record<string, unknown>,
          ['name', 'date', 'startTime', 'endTime', 'location', 'estimatedCost'],
        );
        const entry = auditEntry
          ? this.audit.toEntry(auditEntry)
          : lines.length
            ? this.audit.toEntry(
                this.audit.buildEntry(
                  patch.addedBy ?? before.addedBy,
                  patch.addedByName ?? before.addedByName,
                  'Updated activity',
                  lines.join('; '),
                ),
              )
            : null;
        d.activities[idx] = {
          ...before,
          ...patch,
          auditLog: entry ? [...(before.auditLog ?? []), entry] : before.auditLog,
        };
        updated = d.activities[idx];
      }
    });
    return of(updated).pipe(switchMap((a) => delay(a)));
  }

  move(
    id: string,
    date: string,
    startTime: string,
    endTime: string | undefined,
    auditEntry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Observable<Activity> {
    return this.update(id, { date, startTime, endTime }, auditEntry);
  }

  delete(
    id: string,
    auditEntry?: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  ): Observable<void> {
    this.store.update((d) => {
      const idx = d.activities.findIndex((a) => a.id === id);
      if (idx >= 0 && auditEntry) {
        /* audit preserved only if needed — activity removed */
      }
      d.activities = d.activities.filter((a) => a.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
