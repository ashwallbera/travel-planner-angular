import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { BudgetCategory } from '../../../core/models';
import { BUDGET_CATEGORY_LABELS } from '../../../core/models';
import { ACTIVITY_REPOSITORY, BUDGET_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { ChangelogService } from '../../../core/services/changelog.service';
import { MockAuthService } from '../../../data/mock/mock-auth.service';
import { ItineraryBudgetSyncService } from '../../../features/itinerary/services/itinerary-budget-sync.service';

@Component({
  selector: 'app-quick-add-sheet',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './quick-add-sheet.html',
  styleUrl: './quick-add-sheet.scss',
})
export class QuickAddSheet {
  readonly tripId = input.required<string>();
  readonly open = input(false);
  readonly closed = output<void>();

  private readonly budget = inject(BUDGET_REPOSITORY);
  private readonly activities = inject(ACTIVITY_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly changelog = inject(ChangelogService);
  private readonly budgetSync = inject(ItineraryBudgetSyncService);

  readonly mode = signal<'menu' | 'expense' | 'activity'>('menu');

  expenseLabel = '';
  expenseAmount = 0;
  expenseCategory: BudgetCategory = 'food_drinks';

  activityName = '';
  activityDate = '';
  activityStartTime = '10:00';

  readonly categoryLabels = BUDGET_CATEGORY_LABELS;
  readonly categories = Object.keys(BUDGET_CATEGORY_LABELS) as BudgetCategory[];

  close(): void {
    this.mode.set('menu');
    this.closed.emit();
  }

  saveExpense(): void {
    const user = this.auth.currentUser();
    if (!user || !this.expenseLabel.trim() || this.expenseAmount <= 0) return;
    this.budget
      .create({
        tripId: this.tripId(),
        category: this.expenseCategory,
        label: this.expenseLabel.trim(),
        amount: this.expenseAmount,
        date: new Date().toISOString().slice(0, 10),
        addedBy: user.id,
        addedByName: user.displayName,
        source: { type: 'manual' },
      })
      .subscribe(() => {
        this.changelog.log(
          this.tripId(),
          'budget_entry_created',
          `Added expense "${this.expenseLabel.trim()}"`,
          user.id,
          user.displayName,
        );
        this.expenseLabel = '';
        this.expenseAmount = 0;
        this.close();
      });
  }

  saveActivity(): void {
    const user = this.auth.currentUser();
    if (!user || !this.activityName.trim() || !this.activityDate) return;
    this.activities
      .create({
        tripId: this.tripId(),
        name: this.activityName.trim(),
        date: this.activityDate,
        startTime: this.activityStartTime,
        addedBy: user.id,
        addedByName: user.displayName,
      })
      .subscribe((a) => {
        this.budgetSync.syncActivity(a);
        this.changelog.log(
          this.tripId(),
          'activity_created',
          `Added activity "${a.name}"`,
          user.id,
          user.displayName,
        );
        this.activityName = '';
        this.close();
      });
  }
}
