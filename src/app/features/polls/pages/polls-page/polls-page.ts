import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import {
  POLL_CATEGORY_LABELS,
  type Poll,
  type PollCategory,
} from '../../../../core/models';
import { HOTEL_TAGS, MAX_POLL_TAGS, RESTAURANT_TAGS } from '../../../../core/constants/poll-tags';
import { MEMBER_REPOSITORY, POLL_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { PollConsensusService } from '../../../../core/services/poll-consensus.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChangelogService } from '../../../../core/services/changelog.service';
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
  private readonly members = inject(MEMBER_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly consensus = inject(PollConsensusService);
  private readonly notifications = inject(NotificationService);
  private readonly changelog = inject(ChangelogService);

  readonly categoryLabels = POLL_CATEGORY_LABELS;
  readonly categories = Object.keys(POLL_CATEGORY_LABELS) as PollCategory[];

  showForm = signal(false);
  selected = signal<Poll | null>(null);
  title = '';
  category: PollCategory = 'general';
  option1 = '';
  option2 = '';
  option3 = '';
  opt1Price?: number;
  opt2Price?: number;
  opt3Price?: number;
  opt1Link = '';
  opt2Link = '';
  opt3Link = '';
  selectedTags: string[] = [];
  deadline = '';

  readonly pollList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.polls.list(id)),
    ),
    { initialValue: [] },
  );

  readonly memberList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.members.listMembers(id)),
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

  readonly tagOptions = computed(() => {
    const cat = this.category;
    if (cat === 'hotel') return [...HOTEL_TAGS];
    if (cat === 'restaurant') return [...RESTAURANT_TAGS];
    return [];
  });

  consensusResult = computed(() => {
    const poll = this.selected();
    if (!poll) return null;
    return this.consensus.analyze(poll, this.votes(), this.memberList().length);
  });

  create(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.title.trim()) return;
    const raw = [
      { label: this.option1, price: this.opt1Price, link: this.opt1Link },
      { label: this.option2, price: this.opt2Price, link: this.opt2Link },
      { label: this.option3, price: this.opt3Price, link: this.opt3Link },
    ];
    const opts = raw.filter((o) => o.label.trim());
    if (opts.length < 2) return;
    this.polls
      .create({
        tripId,
        title: this.title.trim(),
        category: this.category,
        options: opts.map((o) => ({
          label: o.label.trim(),
          price: o.price,
          link: o.link || undefined,
          tags: this.selectedTags.length ? [...this.selectedTags] : undefined,
        })),
        deadline: this.deadline || undefined,
        createdBy: user.id,
        createdByName: user.displayName,
      })
      .subscribe((poll) => {
        this.changelog.log(
          tripId,
          'poll_created',
          `Created poll "${poll.title}"`,
          user.id,
          user.displayName,
        );
        this.showForm.set(false);
      });
  }

  openPoll(p: Poll): void {
    this.selected.set(p);
  }

  vote(optionId: string): void {
    const p = this.selected();
    const user = this.auth.currentUser();
    if (!p || !user || p.status === 'closed' || p.status === 'locked') return;
    this.polls.vote(p.id, user.id, optionId).subscribe(() => {
      this.polls.getById(p.id).subscribe((updated) => updated && this.selected.set(updated));
    });
  }

  confirmChoice(): void {
    const p = this.selected();
    const user = this.auth.currentUser();
    if (!p || !user) return;
    this.polls.confirm(p.id, user.id).subscribe((updated) => {
      this.selected.set(updated);
      if (updated.status === 'locked') {
        this.changelog.log(
          p.tripId,
          'poll_locked',
          `Poll "${p.title}" locked by group consensus`,
          user.id,
          user.displayName,
        );
      }
    });
  }

  flagConcern(): void {
    const p = this.selected();
    const user = this.auth.currentUser();
    if (!p || !user) return;
    this.polls.flagConcern(p.id, user.id, user.displayName).subscribe((updated) => {
      this.selected.set(updated);
    });
  }

  executiveLock(optionId: string): void {
    const p = this.selected();
    const user = this.auth.currentUser();
    const trip = this.ctx.trip();
    if (!p || !user || trip?.organizerId !== user.id) return;
    this.polls.executiveLock(p.id, optionId).subscribe((updated) => {
      this.selected.set(updated);
      this.changelog.log(
        p.tripId,
        'poll_locked',
        `Poll "${p.title}" locked by organizer decision`,
        user.id,
        user.displayName,
      );
    });
  }

  nudgeMember(targetId: string): void {
    const p = this.selected();
    const user = this.auth.currentUser();
    if (!p || !user || targetId === user.id) return;
    this.polls.canNudge(p.id, user.id, targetId).subscribe((ok) => {
      if (!ok) {
        this.notifications.showToast('Nudge limit', 'You can only nudge this person once per day.');
        return;
      }
      this.polls.recordNudge(p.id, user.id, targetId).subscribe();
      this.notifications.notifyUser(
        p.tripId,
        targetId,
        'poll_nudge',
        'Poll reminder',
        'Someone in your group nudged you to vote on a poll.',
      );
      this.notifications.showToast('Nudge sent', 'Anonymous reminder sent (mock).');
    });
  }

  toggleTag(tag: string): void {
    const set = new Set(this.selectedTags);
    if (set.has(tag)) set.delete(tag);
    else if (set.size < MAX_POLL_TAGS) set.add(tag);
    this.selectedTags = [...set];
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

  notVotedMembers(): string[] {
    const v = this.votes();
    return this.memberList().filter((m) => !v[m.userId]).map((m) => m.userId);
  }

  isOrganizer(): boolean {
    const user = this.auth.currentUser();
    return user?.id === this.ctx.trip()?.organizerId;
  }

  statusLabel(status: Poll['status']): string {
    return status;
  }
}
