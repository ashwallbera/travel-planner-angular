import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { Poll } from '../../../core/models';
import { PollAutoPopulateService } from '../../../core/services/poll-auto-populate.service';
import { PollConsensusService } from '../../../core/services/poll-consensus.service';
import type { CreatePollInput, PollRepository } from '../../repositories/poll.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockPollRepository implements PollRepository {
  private readonly store = inject(InMemoryStore);
  private readonly consensus = inject(PollConsensusService);
  private readonly autoPopulate = inject(PollAutoPopulateService);

  list(tripId: string): Observable<Poll[]> {
    return this.store.data$.pipe(
      map((d) => {
        const now = Date.now();
        return d.polls
          .filter((p) => p.tripId === tripId)
          .map((p) => this.maybeAutoClose(p, now))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }),
    );
  }

  getById(id: string): Observable<Poll | undefined> {
    return this.store.data$.pipe(
      map((d) => {
        const p = d.polls.find((x) => x.id === id);
        return p ? this.maybeAutoClose(p, Date.now()) : undefined;
      }),
    );
  }

  create(input: CreatePollInput): Observable<Poll> {
    const poll: Poll = {
      id: newId(),
      tripId: input.tripId,
      title: input.title,
      category: input.category,
      options: input.options.map((o) => ({ ...o, id: newId() })),
      deadline: input.deadline,
      status: 'open',
      confirmations: [],
      concerns: [],
      createdBy: input.createdBy,
      createdByName: input.createdByName,
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => d.polls.push(poll));
    return of(poll).pipe(switchMap((p) => delay(p)));
  }

  vote(pollId: string, userId: string, optionId: string): Observable<void> {
    this.store.update((d) => {
      const poll = d.polls.find((p) => p.id === pollId);
      if (!poll || poll.status === 'closed' || poll.status === 'locked') return;
      d.pollVotes = d.pollVotes.filter((v) => !(v.pollId === pollId && v.userId === userId));
      d.pollVotes.push({ pollId, userId, optionId });
    });
    this.checkConsensus(pollId);
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  getVotes(pollId: string): Observable<Record<string, string>> {
    return this.store.data$.pipe(
      map((d) => {
        const mapVotes: Record<string, string> = {};
        d.pollVotes.filter((v) => v.pollId === pollId).forEach((v) => {
          mapVotes[v.userId] = v.optionId;
        });
        return mapVotes;
      }),
    );
  }

  confirm(pollId: string, userId: string): Observable<Poll> {
    this.store.update((d) => {
      const poll = d.polls.find((p) => p.id === pollId);
      if (!poll || poll.status !== 'finalizing') return;
      const confirmations = new Set(poll.confirmations ?? []);
      confirmations.add(userId);
      poll.confirmations = [...confirmations];
      poll.concerns = (poll.concerns ?? []).filter((c) => c.userId !== userId);
    });
    const poll = this.getPollSnapshot(pollId);
    if (poll && poll.status === 'finalizing') {
      const memberIds = this.memberIdsForTrip(poll.tripId);
      if (this.consensus.allConfirmed(poll, memberIds) && poll.lockedOptionId) {
        return this.lock(pollId, poll.lockedOptionId, 'consensus');
      }
    }
    return of(poll!).pipe(switchMap((p) => delay(p)));
  }

  flagConcern(
    pollId: string,
    userId: string,
    userName: string,
    message?: string,
  ): Observable<Poll> {
    this.store.update((d) => {
      const poll = d.polls.find((p) => p.id === pollId);
      if (!poll || poll.status !== 'finalizing') return;
      poll.status = 'open';
      poll.confirmations = [];
      poll.concerns = [
        ...(poll.concerns ?? []).filter((c) => c.userId !== userId),
        { userId, userName, message, createdAt: new Date().toISOString() },
      ];
    });
    return of(this.getPollSnapshot(pollId)!).pipe(switchMap((p) => delay(p)));
  }

  executiveLock(pollId: string, optionId: string): Observable<Poll> {
    return this.lock(pollId, optionId, 'executive');
  }

  lock(pollId: string, optionId: string, method: 'consensus' | 'executive'): Observable<Poll> {
    let updated!: Poll;
    this.store.update((d) => {
      const idx = d.polls.findIndex((p) => p.id === pollId);
      if (idx >= 0 && d.polls[idx].status !== 'locked' && d.polls[idx].status !== 'closed') {
        d.polls[idx] = {
          ...d.polls[idx],
          status: 'locked',
          lockedOptionId: optionId,
          lockMethod: method,
        };
        updated = d.polls[idx];
      }
    });
    void this.autoPopulate.populateFromPoll(updated, optionId);
    return of(updated).pipe(switchMap((p) => delay(p)));
  }

  close(pollId: string): Observable<Poll> {
    let updated!: Poll;
    this.store.update((d) => {
      const idx = d.polls.findIndex((p) => p.id === pollId);
      if (idx >= 0) {
        d.polls[idx] = { ...d.polls[idx], status: 'closed' };
        updated = d.polls[idx];
      }
    });
    return of(updated).pipe(switchMap((p) => delay(p)));
  }

  canNudge(pollId: string, senderId: string, targetId: string): Observable<boolean> {
    return this.store.data$.pipe(
      map((d) => {
        const today = new Date().toISOString().slice(0, 10);
        return !d.pollNudges.some(
          (n) =>
            n.pollId === pollId &&
            n.senderId === senderId &&
            n.targetId === targetId &&
            n.sentAt.slice(0, 10) === today,
        );
      }),
    );
  }

  recordNudge(pollId: string, senderId: string, targetId: string): Observable<void> {
    this.store.update((d) => {
      d.pollNudges.push({
        pollId,
        senderId,
        targetId,
        sentAt: new Date().toISOString(),
      });
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  private checkConsensus(pollId: string): void {
    const d = this.store.snapshot();
    const poll = d.polls.find((p) => p.id === pollId);
    if (!poll || poll.status !== 'open') return;

    const votes: Record<string, string> = {};
    d.pollVotes.filter((v) => v.pollId === pollId).forEach((v) => {
      votes[v.userId] = v.optionId;
    });
    const memberCount = d.members.filter((m) => m.tripId === poll.tripId).length;
    const result = this.consensus.analyze(poll, votes, memberCount);

    if (this.consensus.canTransitionToFinalizing(poll, result) && result.leadingOptionId) {
      this.store.update((data) => {
        const idx = data.polls.findIndex((p) => p.id === pollId);
        if (idx >= 0 && data.polls[idx].status === 'open') {
          data.polls[idx] = {
            ...data.polls[idx],
            status: 'finalizing',
            lockedOptionId: result.leadingOptionId,
            confirmations: [],
          };
        }
      });
    }
  }

  private getPollSnapshot(pollId: string): Poll | undefined {
    return this.store.snapshot().polls.find((p) => p.id === pollId);
  }

  private memberIdsForTrip(tripId: string): string[] {
    return this.store.snapshot().members.filter((m) => m.tripId === tripId).map((m) => m.userId);
  }

  private maybeAutoClose(poll: Poll, now: number): Poll {
    if (
      (poll.status === 'open' || poll.status === 'finalizing') &&
      poll.deadline &&
      new Date(poll.deadline).getTime() <= now
    ) {
      this.store.update((d) => {
        const idx = d.polls.findIndex((p) => p.id === poll.id);
        if (idx >= 0 && d.polls[idx].status !== 'locked' && d.polls[idx].status !== 'closed') {
          d.polls[idx] = { ...d.polls[idx], status: 'closed', lockMethod: 'deadline' };
        }
      });
      return { ...poll, status: 'closed', lockMethod: 'deadline' };
    }
    return poll;
  }
}
