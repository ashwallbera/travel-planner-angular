import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { BudgetEntry, BudgetSourceType } from '../../../core/models';
import type {
  BudgetEntryInput,
  BudgetRepository,
  SyncFromSourceInput,
} from '../../repositories/budget.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockBudgetRepository implements BudgetRepository {
  private readonly store = inject(InMemoryStore);

  list(tripId: string): Observable<BudgetEntry[]> {
    return this.store.data$.pipe(
      map((d) => d.budgetEntries.filter((e) => e.tripId === tripId)),
    );
  }

  create(input: BudgetEntryInput): Observable<BudgetEntry> {
    const entry: BudgetEntry = { ...input, id: newId() };
    this.store.update((d) => d.budgetEntries.push(entry));
    return of(entry).pipe(switchMap((e) => delay(e)));
  }

  update(id: string, patch: Partial<BudgetEntry>): Observable<BudgetEntry> {
    let updated!: BudgetEntry;
    this.store.update((d) => {
      const idx = d.budgetEntries.findIndex((e) => e.id === id);
      if (idx >= 0) {
        d.budgetEntries[idx] = { ...d.budgetEntries[idx], ...patch };
        updated = d.budgetEntries[idx];
      }
    });
    return of(updated).pipe(switchMap((e) => delay(e)));
  }

  delete(id: string): Observable<void> {
    this.store.update((d) => {
      d.budgetEntries = d.budgetEntries.filter((e) => e.id !== id);
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  syncFromSource(input: SyncFromSourceInput): Observable<BudgetEntry> {
    const existing = this.store.snapshot().budgetEntries.find(
      (e) => e.source?.refId === input.refId && e.source?.type === input.sourceType,
    );
    const label =
      input.sourceType === 'itinerary'
        ? `From Itinerary: ${input.label}`
        : input.sourceType === 'pocket'
          ? `From Pocket: ${input.label}`
          : input.label;
    if (existing) {
      return this.update(existing.id, {
        amount: input.amount,
        label,
        date: input.date,
        category: input.category,
      });
    }
    return this.create({
      tripId: input.tripId,
      category: input.category,
      label,
      amount: input.amount,
      date: input.date,
      addedBy: input.addedBy,
      addedByName: input.addedByName,
      source: { type: input.sourceType, refId: input.refId },
    });
  }

  deleteBySourceRef(refId: string, sourceType: BudgetSourceType): Observable<void> {
    this.store.update((d) => {
      d.budgetEntries = d.budgetEntries.filter(
        (e) => !(e.source?.refId === refId && e.source?.type === sourceType),
      );
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  setTripBudgetLimit(tripId: string, limit: number): Observable<void> {
    this.store.update((d) => {
      const trip = d.trips.find((t) => t.id === tripId);
      if (trip) trip.budgetLimit = limit;
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }
}
