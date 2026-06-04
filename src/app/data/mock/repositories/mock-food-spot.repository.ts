import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { FoodSpot } from '../../../core/models';
import type { FoodSpotInput, FoodSpotRepository } from '../../repositories/food-spot.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockFoodSpotRepository implements FoodSpotRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<FoodSpot[]> {
    return this.store.data$.pipe(
      map((d) => d.foodSpots.filter((f) => f.tripId === tripId)),
    );
  }

  create(input: FoodSpotInput): Observable<FoodSpot> {
    const spot: FoodSpot = {
      ...input,
      id: newId(),
      triedBy: [],
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => d.foodSpots.push(spot));
    return of(spot).pipe(switchMap((s) => delay(s)));
  }

  update(id: string, patch: Partial<FoodSpot>): Observable<FoodSpot> {
    let updated!: FoodSpot;
    this.store.update((d) => {
      const idx = d.foodSpots.findIndex((f) => f.id === id);
      if (idx >= 0) {
        d.foodSpots[idx] = { ...d.foodSpots[idx], ...patch };
        updated = d.foodSpots[idx];
      }
    });
    return of(updated).pipe(switchMap((s) => delay(s)));
  }

  toggleTried(id: string, userId: string): Observable<FoodSpot> {
    let updated!: FoodSpot;
    this.store.update((d) => {
      const idx = d.foodSpots.findIndex((f) => f.id === id);
      if (idx >= 0) {
        const tried = new Set(d.foodSpots[idx].triedBy);
        if (tried.has(userId)) tried.delete(userId);
        else tried.add(userId);
        d.foodSpots[idx] = { ...d.foodSpots[idx], triedBy: [...tried] };
        updated = d.foodSpots[idx];
      }
    });
    return of(updated).pipe(switchMap((s) => delay(s)));
  }

  delete(id: string): Observable<void> {
    this.store.update((d) => {
      d.foodSpots = d.foodSpots.filter((f) => f.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
