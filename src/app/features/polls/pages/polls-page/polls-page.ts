import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import type { Poll } from '../../../../core/models';
import { POLL_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-polls-page',
  standalone: true,
  imports: [FormsModule, PageHeader, EmptyState, DatePipe],
  templateUrl: './polls-page.html',
  styleUrl: './polls-page.scss',
})
export class PollsPage {
  readonly ctx = inject(TripContextService);
  private readonly polls = inject(POLL_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  showForm = signal(false);
  selected = signal<Poll | null>(null);
  title = '';
  option1 = '';
  option2 = '';
  option3 = '';
  deadline = '';

  readonly pollList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.polls.list(id)),
    ),
    { initialValue: [] },
  );

  readonly votes = toSignal(
    toObservable(computed(() => this.selected()?.id)).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.polls.getVotes(id)),
    ),
    { initialValue: {} as Record<string, string> },
  );

  create(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.title.trim()) return;
    const opts = [this.option1, this.option2, this.option3].filter((o) => o.trim());
    if (opts.length < 2) return;
    this.polls
      .create({
        tripId,
        title: this.title.trim(),
        options: opts.map((label) => ({ label: label.trim() })),
        deadline: this.deadline || undefined,
        createdBy: user.id,
        createdByName: user.displayName,
      })
      .subscribe(() => this.showForm.set(false));
  }

  openPoll(p: Poll): void {
    this.selected.set(p);
  }

  vote(optionId: string): void {
    const p = this.selected();
    const user = this.auth.currentUser();
    if (!p || !user || p.status === 'closed') return;
    this.polls.vote(p.id, user.id, optionId).subscribe();
  }

  closePoll(): void {
    const p = this.selected();
    if (!p) return;
    this.polls.close(p.id).subscribe((updated) => this.selected.set(updated));
  }

  resultPercent(poll: Poll, optionId: string): number {
    const v = this.votes();
    const total = Object.keys(v).length || 1;
    const count = Object.values(v).filter((id) => id === optionId).length;
    return Math.round((count / total) * 100);
  }

  voteCount(optionId: string): number {
    return Object.values(this.votes()).filter((id) => id === optionId).length;
  }

  myVote(): string | undefined {
    const user = this.auth.currentUser();
    return user ? this.votes()[user.id] : undefined;
  }

  isLeader(poll: Poll, optionId: string): boolean {
    let max = 0;
    let leader: string | null = null;
    for (const o of poll.options) {
      const c = this.voteCount(o.id);
      if (c >= max) {
        max = c;
        leader = o.id;
      }
    }
    return leader === optionId && max > 0;
  }
}
