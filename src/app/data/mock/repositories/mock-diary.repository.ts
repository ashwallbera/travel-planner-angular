import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { DiaryEntry } from '../../../core/models';
import type { DiaryEntryInput, DiaryRepository } from '../../repositories/diary.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockDiaryRepository implements DiaryRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<DiaryEntry[]> {
    return this.store.data$.pipe(
      map((d) =>
        d.diaryEntries
          .filter((e) => e.tripId === tripId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    );
  }

  create(input: DiaryEntryInput): Observable<DiaryEntry> {
    const entry: DiaryEntry = { ...input, id: newId(), createdAt: new Date().toISOString() };
    this.store.update((d) => d.diaryEntries.push(entry));
    return of(entry).pipe(switchMap((e) => delay(e)));
  }

  delete(id: string): Observable<void> {
    this.store.update((d) => {
      d.diaryEntries = d.diaryEntries.filter((e) => e.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
