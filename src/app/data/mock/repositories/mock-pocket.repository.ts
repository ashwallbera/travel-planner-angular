import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { PocketItem } from '../../../core/models';
import type { PocketItemInput, PocketRepository } from '../../repositories/pocket.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';
import { compareDateStrings } from '../../../core/utils/date.utils';

@Injectable()
export class MockPocketRepository implements PocketRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<PocketItem[]> {
    return this.store.data$.pipe(
      map((d) =>
        d.pocketItems
          .filter((p) => p.tripId === tripId)
          .sort((a, b) => compareDateStrings(a.useDate, b.useDate)),
      ),
    );
  }

  getById(id: string): Observable<PocketItem | undefined> {
    return this.store.data$.pipe(map((d) => d.pocketItems.find((p) => p.id === id)));
  }

  create(input: PocketItemInput): Observable<PocketItem> {
    const item: PocketItem = { ...input, id: newId(), createdAt: new Date().toISOString() };
    this.store.update((d) => d.pocketItems.push(item));
    return of(item).pipe(switchMap((i) => delay(i)));
  }

  update(id: string, patch: Partial<PocketItem>): Observable<PocketItem> {
    let updated!: PocketItem;
    this.store.update((d) => {
      const idx = d.pocketItems.findIndex((p) => p.id === id);
      if (idx >= 0) {
        d.pocketItems[idx] = { ...d.pocketItems[idx], ...patch };
        updated = d.pocketItems[idx];
      }
    });
    return of(updated).pipe(switchMap((i) => delay(i)));
  }

  delete(id: string): Observable<void> {
    this.store.update((d) => {
      d.pocketItems = d.pocketItems.filter((p) => p.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
