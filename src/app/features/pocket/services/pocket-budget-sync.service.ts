import { inject, Injectable } from '@angular/core';
import type { BudgetCategory, PocketItem, PocketItemType } from '../../../core/models';
import { BUDGET_REPOSITORY } from '../../../core/tokens/repository.tokens';

const POCKET_TO_BUDGET: Record<PocketItemType, BudgetCategory> = {
  flight: 'flights',
  accommodation: 'accommodation',
  entrance: 'activities',
  transport: 'transport',
  others: 'others',
};

@Injectable({ providedIn: 'root' })
export class PocketBudgetSyncService {
  private readonly budget = inject(BUDGET_REPOSITORY);

  syncItem(item: PocketItem): void {
    if (item.amount == null) return;
    this.budget
      .syncFromSource({
        tripId: item.tripId,
        category: POCKET_TO_BUDGET[item.type],
        label: item.label,
        amount: item.amount,
        date: item.useDate,
        addedBy: item.addedBy,
        addedByName: item.addedByName,
        sourceType: 'pocket',
        refId: item.id,
      })
      .subscribe();
  }

  removeForItem(itemId: string): void {
    this.budget.deleteBySourceRef(itemId, 'pocket').subscribe();
  }
}
