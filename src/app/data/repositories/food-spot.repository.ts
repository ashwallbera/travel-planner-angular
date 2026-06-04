import type { Observable } from 'rxjs';
import type { FoodSpot, MealType } from '../../core/models';

export type FoodSpotInput = Omit<FoodSpot, 'id' | 'createdAt' | 'triedBy'>;

export interface FoodSpotRepository {
  list(tripId: string): Observable<FoodSpot[]>;
  create(input: FoodSpotInput): Observable<FoodSpot>;
  update(id: string, patch: Partial<FoodSpot>): Observable<FoodSpot>;
  toggleTried(id: string, userId: string): Observable<FoodSpot>;
  delete(id: string): Observable<void>;
}
