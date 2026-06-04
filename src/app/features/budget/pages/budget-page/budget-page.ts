import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import {
  BUDGET_CATEGORY_LABELS,
  type BudgetCategory,
  type BudgetEntry,
} from '../../../../core/models';
import { BUDGET_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { formatMoney } from '../../../../core/utils/currency.utils';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { BudgetOverview } from '../../components/budget-overview/budget-overview';

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [FormsModule, PageHeader, BudgetOverview],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.scss',
})
export class BudgetPage {
  readonly ctx = inject(TripContextService);
  private readonly budget = inject(BUDGET_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  readonly labels = BUDGET_CATEGORY_LABELS;
  readonly categories = Object.keys(BUDGET_CATEGORY_LABELS) as BudgetCategory[];

  showForm = signal(false);
  category: BudgetCategory = 'food_drinks';
  label = '';
  amount = 0;
  budgetLimitInput = 0;

  readonly entries = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.budget.list(id)),
    ),
    { initialValue: [] },
  );

  readonly spent = computed(() =>
    this.entries().reduce((s, e) => s + e.amount, 0),
  );

  saveLimit(): void {
    const id = this.ctx.tripId();
    if (!id) return;
    this.budget.setTripBudgetLimit(id, this.budgetLimitInput).subscribe(() => this.ctx.reload());
  }

  addEntry(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.label.trim()) return;
    this.budget
      .create({
        tripId,
        category: this.category,
        label: this.label.trim(),
        amount: this.amount,
        date: new Date().toISOString().slice(0, 10),
        addedBy: user.id,
        addedByName: user.displayName,
        source: { type: 'manual' },
      })
      .subscribe(() => {
        this.showForm.set(false);
        this.label = '';
        this.amount = 0;
      });
  }

  deleteEntry(e: BudgetEntry): void {
    if (!confirm('Delete this entry?')) return;
    this.budget.delete(e.id).subscribe();
  }

  format(amount: number): string {
    return formatMoney(amount, this.ctx.trip()?.currency ?? 'PHP');
  }

  byCategory(cat: BudgetCategory): BudgetEntry[] {
    return this.entries().filter((e) => e.category === cat);
  }

  categorySpent(cat: BudgetCategory): number {
    return this.byCategory(cat).reduce((s, e) => s + e.amount, 0);
  }
}
