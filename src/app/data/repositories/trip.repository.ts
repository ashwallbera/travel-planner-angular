import type { Observable } from 'rxjs';
import type { CreateTripDto, Trip } from '../../core/models';

export interface TripRepository {
  listForUser(userId: string): Observable<Trip[]>;
  getById(tripId: string): Observable<Trip | undefined>;
  create(dto: CreateTripDto, organizerId: string): Observable<Trip>;
  update(tripId: string, patch: Partial<Trip>): Observable<Trip>;
}
