import { inject, Injectable } from '@angular/core';
import type { Activity } from '../../../core/models';
import { BUDGET_REPOSITORY } from '../../../core/tokens/repository.tokens';

@Injectable({ providedIn: 'root' })
export class ItineraryBudgetSyncService {
  private readonly budget = inject(BUDGET_REPOSITORY);

  syncActivity(activity: Activity): void {
    if (!activity.estimatedCost) return;
    this.budget
      .syncFromSource({
        tripId: activity.tripId,
        category: 'activities',
        label: activity.name,
        amount: activity.estimatedCost,
        date: activity.date,
        addedBy: activity.addedBy,
        addedByName: activity.addedByName,
        sourceType: 'itinerary',
        refId: activity.id,
      })
      .subscribe();
  }

  removeForActivity(activityId: string): void {
    this.budget.deleteBySourceRef(activityId, 'itinerary').subscribe();
  }
}
