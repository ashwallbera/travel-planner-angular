import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { BudgetEntry, BudgetSourceType } from '../../../core/models';
import { AuditTrailService } from '../../../core/services/audit-trail.service';
import type {
  BudgetEntryInput,
  BudgetRepository,
  SyncFromSourceInput,
} from '../../repositories/budget.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockBudgetRepository implements BudgetRepository {
  private readonly store = inject(InMemoryStore);
  private readonly audit = inject(AuditTrailService);

  list(tripId: string): Observable<BudgetEntry[]> {
    return this.store.data$.pipe(
      map((d) => d.budgetEntries.filter((e) => e.tripId === tripId)),
    );
  }

  create(input: BudgetEntryInput): Observable<BudgetEntry> {
    const memberIds = this.store
      .snapshot()
      .members.filter((m) => m.tripId === input.tripId)
      .map((m) => m.userId);
    const entry: BudgetEntry = {
      ...input,
      id: newId(),
      paid: input.paid ?? false,
      coveredBy: input.coveredBy?.length ? input.coveredBy : memberIds,
      auditLog: [
        this.audit.toEntry(
          this.audit.buildEntry(input.addedBy, input.addedByName, 'Created expense'),
        ),
      ],
    };
    this.store.update((d) => d.budgetEntries.push(entry));
    return of(entry).pipe(switchMap((e) => delay(e)));
  }

  update(id: string, patch: Partial<BudgetEntry>): Observable<BudgetEntry> {
    let updated!: BudgetEntry;
    this.store.update((d) => {
      const idx = d.budgetEntries.findIndex((e) => e.id === id);
      if (idx >= 0) {
        const before = d.budgetEntries[idx];
        const lines = this.audit.diffFields(
          before as unknown as Record<string, unknown>,
          patch as Record<string, unknown>,
          ['label', 'amount', 'category', 'paid', 'payerId'],
        );
        const log = lines.length
          ? [
              ...(before.auditLog ?? []),
              this.audit.toEntry(
                this.audit.buildEntry(
                  patch.addedBy ?? before.addedBy,
                  patch.addedByName ?? before.addedByName,
                  'Updated expense',
                  lines.join('; '),
                ),
              ),
            ]
          : before.auditLog;
        d.budgetEntries[idx] = { ...before, ...patch, auditLog: log };
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
          : input.sourceType === 'poll'
            ? input.label.startsWith('From Poll')
              ? input.label
              : `From Poll: ${input.label}`
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
