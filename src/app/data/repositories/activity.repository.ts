import type { Observable } from 'rxjs';
import type { Activity } from '../../core/models';

export type ActivityInput = Omit<Activity, 'id' | 'createdAt'>;

export interface ActivityRepository {
  list(tripId: string): Observable<Activity[]>;
  getById(id: string): Observable<Activity | undefined>;
  create(input: ActivityInput): Observable<Activity>;
  update(id: string, patch: Partial<Activity>): Observable<Activity>;
  delete(id: string): Observable<void>;
}
