import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ACTIVITY_REPOSITORY,
  BUDGET_REPOSITORY,
  DIARY_REPOSITORY,
  POLL_REPOSITORY,
} from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { formatMoney } from '../../../../core/utils/currency.utils';
import { isTripPast } from '../../../../core/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-post-trip-summary-page',
  standalone: true,
  imports: [PageHeader, RouterLink],
  templateUrl: './post-trip-summary-page.html',
  styleUrl: './post-trip-summary-page.scss',
})
export class PostTripSummaryPage {
  readonly ctx = inject(TripContextService);
  private readonly budget = inject(BUDGET_REPOSITORY);
  private readonly activities = inject(ACTIVITY_REPOSITORY);
  private readonly polls = inject(POLL_REPOSITORY);
  private readonly diary = inject(DIARY_REPOSITORY);

  readonly available = computed(() => {
    const trip = this.ctx.trip();
    return trip ? isTripPast(trip) : false;
  });

  readonly stats = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) =>
        combineLatest([
          this.budget.list(id),
          this.activities.list(id),
          this.polls.list(id),
          this.diary.list(id),
        ]).pipe(
          map(([entries, acts, pollList, diaryEntries]) => ({
            spent: entries.reduce((s, e) => s + e.amount, 0),
            activities: acts.length,
            polls: pollList.filter((p) => p.status === 'locked').length,
            diary: diaryEntries.length,
          })),
        ),
      ),
    ),
    { initialValue: { spent: 0, activities: 0, polls: 0, diary: 0 } },
  );

  format(amount: number): string {
    return formatMoney(amount, this.ctx.trip()?.currency ?? 'PHP');
  }

  shareSummary(): void {
    const trip = this.ctx.trip();
    if (!trip) return;
    const text = `${trip.name} — Trip Summary\nSpent: ${this.format(this.stats().spent)}\nActivities: ${this.stats().activities}\nDiary entries: ${this.stats().diary}`;
    if (navigator.share) {
      void navigator.share({ title: `${trip.name} Summary`, text });
    } else {
      void navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    }
  }
}
