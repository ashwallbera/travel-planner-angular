import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { Poll } from '../../../core/models';
import type { CreatePollInput, PollRepository } from '../../repositories/poll.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockPollRepository implements PollRepository {
  private readonly store = inject(InMemoryStore);

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
      options: input.options.map((o) => ({ ...o, id: newId() })),
      deadline: input.deadline,
      status: 'open',
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
      if (!poll || poll.status === 'closed') return;
      d.pollVotes = d.pollVotes.filter((v) => !(v.pollId === pollId && v.userId === userId));
      d.pollVotes.push({ pollId, userId, optionId });
    });
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

  private maybeAutoClose(poll: Poll, now: number): Poll {
    if (poll.status === 'open' && poll.deadline && new Date(poll.deadline).getTime() <= now) {
      this.store.update((d) => {
        const idx = d.polls.findIndex((p) => p.id === poll.id);
        if (idx >= 0 && d.polls[idx].status === 'open') {
          d.polls[idx] = { ...d.polls[idx], status: 'closed' };
        }
      });
      return { ...poll, status: 'closed' };
    }
    return poll;
  }
}
