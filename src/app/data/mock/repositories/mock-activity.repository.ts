import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { Activity } from '../../../core/models';
import type { ActivityInput, ActivityRepository } from '../../repositories/activity.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockActivityRepository implements ActivityRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<Activity[]> {
    return this.store.data$.pipe(
      map((d) => d.activities.filter((a) => a.tripId === tripId)),
    );
  }

  getById(id: string): Observable<Activity | undefined> {
    return this.store.data$.pipe(map((d) => d.activities.find((a) => a.id === id)));
  }

  create(input: ActivityInput): Observable<Activity> {
    const activity: Activity = { ...input, id: newId(), createdAt: new Date().toISOString() };
    this.store.update((d) => d.activities.push(activity));
    return of(activity).pipe(switchMap((a) => delay(a)));
  }

  update(id: string, patch: Partial<Activity>): Observable<Activity> {
    let updated!: Activity;
    this.store.update((d) => {
      const idx = d.activities.findIndex((a) => a.id === id);
      if (idx >= 0) {
        d.activities[idx] = { ...d.activities[idx], ...patch };
        updated = d.activities[idx];
      }
    });
    return of(updated).pipe(switchMap((a) => delay(a)));
  }

  delete(id: string): Observable<void> {
    this.store.update((d) => {
      d.activities = d.activities.filter((a) => a.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
