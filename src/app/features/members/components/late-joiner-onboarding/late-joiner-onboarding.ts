import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Trip } from '../../../../core/models';
import { formatTripDateRange, formatTripDestination } from '../../../../core/models';
import { POLL_REPOSITORY, BUDGET_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { formatMoney } from '../../../../core/utils/currency.utils';

@Component({
  selector: 'app-late-joiner-onboarding',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './late-joiner-onboarding.html',
  styleUrl: './late-joiner-onboarding.scss',
})
export class LateJoinerOnboarding {
  readonly trip = input.required<Trip>();
  readonly dismissed = output<void>();

  private readonly polls = inject(POLL_REPOSITORY);
  private readonly budget = inject(BUDGET_REPOSITORY);
  private readonly tripId = computed(() => this.trip().id);

  readonly snapshot = toSignal(
    toObservable(this.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) =>
        combineLatest([this.polls.list(id), this.budget.list(id)]).pipe(
          map(([pollList, entries]) => ({
            lockedPolls: pollList.filter((p) => p.status === 'locked'),
            totalSpent: entries.reduce((s, e) => s + e.amount, 0),
          })),
        ),
      ),
    ),
    { initialValue: { lockedPolls: [], totalSpent: 0 } },
  );

  destination(): string {
    return formatTripDestination(this.trip());
  }

  dates(): string {
    return formatTripDateRange(this.trip());
  }

  spent(): string {
    return formatMoney(this.snapshot().totalSpent, this.trip().currency);
  }
}
