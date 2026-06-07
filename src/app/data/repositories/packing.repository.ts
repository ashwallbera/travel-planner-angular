import type { Observable } from 'rxjs';
import type { PackingItem } from '../../core/models';

export interface PackingItemInput {
  tripId: string;
  name: string;
  addedBy: string;
  addedByName: string;
}

export interface PackingRepository {
  list(tripId: string): Observable<PackingItem[]>;
  create(input: PackingItemInput): Observable<PackingItem>;
  delete(id: string): Observable<void>;
  claim(id: string, userId: string, userName: string): Observable<PackingItem>;
  unclaim(id: string): Observable<PackingItem>;
}
