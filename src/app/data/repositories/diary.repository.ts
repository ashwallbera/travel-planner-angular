import type { Observable } from 'rxjs';
import type { DiaryEntry } from '../../core/models';

export type DiaryEntryInput = Omit<DiaryEntry, 'id' | 'createdAt'>;

export interface DiaryRepository {
  list(tripId: string): Observable<DiaryEntry[]>;
  create(input: DiaryEntryInput): Observable<DiaryEntry>;
  delete(id: string): Observable<void>;
}
