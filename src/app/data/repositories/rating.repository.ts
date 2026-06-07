import type { Observable } from 'rxjs';
import type { ActivityRating, TripRating } from '../../core/models';

export interface RatingRepository {
  getTripRatings(tripId: string): Observable<TripRating[]>;
  upsertTripRating(rating: TripRating): Observable<TripRating>;
  getActivityRatings(tripId: string): Observable<ActivityRating[]>;
  upsertActivityRating(rating: ActivityRating): Observable<ActivityRating>;
}
