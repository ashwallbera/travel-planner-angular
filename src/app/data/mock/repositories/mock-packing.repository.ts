import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { PackingItem } from '../../../core/models';
import type { PackingItemInput, PackingRepository } from '../../repositories/packing.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockPackingRepository implements PackingRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<PackingItem[]> {
    return this.store.data$.pipe(
      map((d) =>
        d.packingItems
          .filter((p) => p.tripId === tripId)
          .sort((a, b) => a.name.localeCompare(b.name)),
      ),
    );
  }

  create(input: PackingItemInput): Observable<PackingItem> {
    const item: PackingItem = {
      id: newId(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => d.packingItems.push(item));
    return of(item).pipe(switchMap((i) => delay(i)));
  }

  delete(id: string): Observable<void> {
    this.store.update((d) => {
      d.packingItems = d.packingItems.filter((p) => p.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  claim(id: string, userId: string, userName: string): Observable<PackingItem> {
    let updated!: PackingItem;
    this.store.update((d) => {
      const idx = d.packingItems.findIndex((p) => p.id === id);
      if (idx >= 0) {
        d.packingItems[idx] = {
          ...d.packingItems[idx],
          claimedBy: userId,
          claimedByName: userName,
        };
        updated = d.packingItems[idx];
      }
    });
    return of(updated).pipe(switchMap((i) => delay(i)));
  }

  unclaim(id: string): Observable<PackingItem> {
    let updated!: PackingItem;
    this.store.update((d) => {
      const idx = d.packingItems.findIndex((p) => p.id === id);
      if (idx >= 0) {
        d.packingItems[idx] = {
          ...d.packingItems[idx],
          claimedBy: undefined,
          claimedByName: undefined,
        };
        updated = d.packingItems[idx];
      }
    });
    return of(updated).pipe(switchMap((i) => delay(i)));
  }
}
