import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { ChangelogEntry } from '../../../core/models';
import type { ChangelogRepository, LogChangelogInput } from '../../repositories/changelog.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockChangelogRepository implements ChangelogRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<ChangelogEntry[]> {
    return this.store.data$.pipe(
      map((d) =>
        d.changelog
          .filter((c) => c.tripId === tripId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    );
  }

  append(input: LogChangelogInput): Observable<ChangelogEntry> {
    const entry: ChangelogEntry = {
      id: newId(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => d.changelog.push(entry));
    return of(entry).pipe(switchMap((e) => delay(e)));
  }
}
