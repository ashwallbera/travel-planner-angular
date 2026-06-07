import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { ActivityRating, TripRating } from '../../../core/models';
import type { RatingRepository } from '../../repositories/rating.repository';
import { delay, InMemoryStore } from '../in-memory-store';

@Injectable()
export class MockRatingRepository implements RatingRepository {
  private readonly store = inject(InMemoryStore);

  getTripRatings(tripId: string): Observable<TripRating[]> {
    return this.store.data$.pipe(
      map((d) => d.tripRatings.filter((r) => r.tripId === tripId)),
    );
  }

  upsertTripRating(rating: TripRating): Observable<TripRating> {
    this.store.update((d) => {
      const idx = d.tripRatings.findIndex(
        (r) => r.tripId === rating.tripId && r.userId === rating.userId,
      );
      if (idx >= 0) d.tripRatings[idx] = rating;
      else d.tripRatings.push(rating);
    });
    return of(rating).pipe(switchMap((r) => delay(r)));
  }

  getActivityRatings(tripId: string): Observable<ActivityRating[]> {
    return this.store.data$.pipe(
      map((d) => d.activityRatings.filter((r) => r.tripId === tripId)),
    );
  }

  upsertActivityRating(rating: ActivityRating): Observable<ActivityRating> {
    this.store.update((d) => {
      const idx = d.activityRatings.findIndex(
        (r) => r.activityId === rating.activityId && r.userId === rating.userId,
      );
      if (idx >= 0) d.activityRatings[idx] = rating;
      else d.activityRatings.push(rating);
    });
    return of(rating).pipe(switchMap((r) => delay(r)));
  }
}
