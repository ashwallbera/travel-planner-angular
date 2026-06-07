import type { Observable } from 'rxjs';
import type { ChangelogEntry, ChangelogEventType } from '../../core/models';

export interface LogChangelogInput {
  tripId: string;
  type: ChangelogEventType;
  summary: string;
  actorId: string;
  actorName: string;
  metadata?: Record<string, unknown>;
}

export interface ChangelogRepository {
  list(tripId: string): Observable<ChangelogEntry[]>;
  append(input: LogChangelogInput): Observable<ChangelogEntry>;
}
