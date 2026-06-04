import type { Observable } from 'rxjs';
import type { PocketItem } from '../../core/models';

export type PocketItemInput = Omit<PocketItem, 'id' | 'createdAt'>;

export interface PocketRepository {
  list(tripId: string): Observable<PocketItem[]>;
  getById(id: string): Observable<PocketItem | undefined>;
  create(input: PocketItemInput): Observable<PocketItem>;
  update(id: string, patch: Partial<PocketItem>): Observable<PocketItem>;
  delete(id: string): Observable<void>;
}
