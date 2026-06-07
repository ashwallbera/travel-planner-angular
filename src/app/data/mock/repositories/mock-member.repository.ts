import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, throwError } from 'rxjs';
import type { InviteToken, TripMember } from '../../../core/models';
import { ChangelogService } from '../../../core/services/changelog.service';
import type { MemberRepository } from '../../repositories/member.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockMemberRepository implements MemberRepository {
  private readonly store = inject(InMemoryStore);
  private readonly changelog = inject(ChangelogService);

  listMembers(tripId: string): Observable<TripMember[]> {
    return this.store.data$.pipe(
      map((d) =>
        d.members
          .filter((m) => m.tripId === tripId)
          .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)),
      ),
    );
  }

  getMember(tripId: string, userId: string): Observable<TripMember | undefined> {
    return this.store.data$.pipe(
      map((d) => d.members.find((m) => m.tripId === tripId && m.userId === userId)),
    );
  }

  getInvite(tripId: string): Observable<InviteToken> {
    return this.store.data$.pipe(
      map((d) => {
        let invite = d.invites.find((i) => i.tripId === tripId);
        if (!invite) {
          const token = newId().slice(0, 12);
          const expires = new Date();
          expires.setDate(expires.getDate() + 7);
          invite = {
            tripId,
            token,
            expiresAt: expires.toISOString(),
            createdAt: new Date().toISOString(),
          };
          this.store.update((data) => data.invites.push(invite!));
        }
        return invite!;
      }),
    );
  }

  regenerateInvite(tripId: string): Observable<InviteToken> {
    const token = newId().slice(0, 12);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const invite: InviteToken = {
      tripId,
      token,
      expiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.store.update((d) => {
      const idx = d.invites.findIndex((i) => i.tripId === tripId);
      if (idx >= 0) d.invites[idx] = invite;
      else d.invites.push(invite);
    });
    return of(invite).pipe(switchMap((i) => delay(i)));
  }

  joinByToken(token: string, userId: string, displayName: string): Observable<string> {
    const d = this.store.snapshot();
    const invite = d.invites.find((i) => i.token === token);
    if (!invite) return throwError(() => new Error('Invalid invite'));
    if (new Date(invite.expiresAt) < new Date()) {
      return throwError(() => new Error('Invite expired'));
    }
    const exists = d.members.some((m) => m.tripId === invite.tripId && m.userId === userId);
    if (!exists) {
      this.store.update((data) => {
        data.members.push({
          tripId: invite.tripId,
          userId,
          displayName,
          joinedAt: new Date().toISOString(),
          isOrganizer: false,
          onboardingSeen: false,
        });
      });
      this.changelog.log(
        invite.tripId,
        'member_joined',
        `${displayName} joined the trip`,
        userId,
        displayName,
      );
    }
    return of(invite.tripId).pipe(switchMap((id) => delay(id)));
  }

  removeMember(tripId: string, userId: string): Observable<void> {
    const member = this.store.snapshot().members.find(
      (m) => m.tripId === tripId && m.userId === userId,
    );
    this.store.update((d) => {
      d.members = d.members.filter((m) => !(m.tripId === tripId && m.userId === userId));
    });
    if (member) {
      this.changelog.log(
        tripId,
        'member_removed',
        `${member.displayName} was removed`,
        userId,
        member.displayName,
      );
    }
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  isMember(tripId: string, userId: string): Observable<boolean> {
    return this.store.data$.pipe(
      map((d) => d.members.some((m) => m.tripId === tripId && m.userId === userId)),
    );
  }

  markOnboardingSeen(tripId: string, userId: string): Observable<void> {
    this.store.update((d) => {
      const m = d.members.find((x) => x.tripId === tripId && x.userId === userId);
      if (m) m.onboardingSeen = true;
    });
    return of(undefined).pipe(switchMap((v) => delay(v)));
  }

  needsOnboarding(tripId: string, userId: string): Observable<boolean> {
    return this.store.data$.pipe(
      map((d) => {
        const member = d.members.find((m) => m.tripId === tripId && m.userId === userId);
        const trip = d.trips.find((t) => t.id === tripId);
        if (!member || !trip || member.isOrganizer || member.onboardingSeen) return false;
        return member.joinedAt > trip.createdAt;
      }),
    );
  }
}
