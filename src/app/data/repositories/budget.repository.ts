import type { Observable } from 'rxjs';
import type { BudgetCategory, BudgetEntry, BudgetSourceType } from '../../core/models';

export type BudgetEntryInput = Omit<BudgetEntry, 'id'>;

export interface SyncFromSourceInput {
  tripId: string;
  category: BudgetCategory;
  label: string;
  amount: number;
  date: string;
  addedBy: string;
  addedByName: string;
  sourceType: BudgetSourceType;
  refId: string;
}

export interface BudgetRepository {
  list(tripId: string): Observable<BudgetEntry[]>;
  create(input: BudgetEntryInput): Observable<BudgetEntry>;
  update(id: string, patch: Partial<BudgetEntry>): Observable<BudgetEntry>;
  delete(id: string): Observable<void>;
  syncFromSource(input: SyncFromSourceInput): Observable<BudgetEntry>;
  deleteBySourceRef(refId: string, sourceType: BudgetSourceType): Observable<void>;
  setTripBudgetLimit(tripId: string, limit: number): Observable<void>;
}
