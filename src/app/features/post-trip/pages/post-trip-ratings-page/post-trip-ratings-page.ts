import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import {
  ACTIVITY_REPOSITORY,
  RATING_REPOSITORY,
} from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { isTripPast } from '../../../../core/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-trip-ratings-page',
  standalone: true,
  imports: [FormsModule, PageHeader],
  templateUrl: './post-trip-ratings-page.html',
  styleUrl: './post-trip-ratings-page.scss',
})
export class PostTripRatingsPage {
  readonly ctx = inject(TripContextService);
  private readonly ratings = inject(RATING_REPOSITORY);
  private readonly activities = inject(ACTIVITY_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  tripRating = 0;
  tripComment = '';
  readonly activityRatings = signal<Record<string, number>>({});

  readonly available = computed(() => {
    const trip = this.ctx.trip();
    return trip ? isTripPast(trip) : false;
  });

  readonly activityList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.activities.list(id)),
    ),
    { initialValue: [] },
  );

  readonly allTripRatings = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.ratings.getTripRatings(id)),
    ),
    { initialValue: [] },
  );

  readonly groupAverage = computed(() => {
    const r = this.allTripRatings();
    if (!r.length) return 0;
    return Math.round((r.reduce((s, x) => s + x.rating, 0) / r.length) * 10) / 10;
  });

  saveTripRating(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || this.tripRating < 1) return;
    this.ratings
      .upsertTripRating({
        tripId,
        userId: user.id,
        rating: this.tripRating,
        comment: this.tripComment || undefined,
        updatedAt: new Date().toISOString(),
      })
      .subscribe();
  }

  saveActivityRating(activityId: string): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    const rating = this.activityRatings()[activityId];
    if (!tripId || !user || !rating) return;
    this.ratings
      .upsertActivityRating({
        activityId,
        tripId,
        userId: user.id,
        rating,
        updatedAt: new Date().toISOString(),
      })
      .subscribe();
  }

  activityRatingFor(activityId: string): number {
    return this.activityRatings()[activityId] ?? 0;
  }

  setActivityRating(activityId: string, rating: number): void {
    this.activityRatings.update((m) => ({ ...m, [activityId]: rating }));
  }
}
