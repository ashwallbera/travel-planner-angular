import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import type { CreateTripDto, Trip, TripMember } from '../../../core/models';
import type { TripRepository } from '../../repositories/trip.repository';
import { delay, InMemoryStore, newId } from '../in-memory-store';

@Injectable()
export class MockTripRepository implements TripRepository {
  private readonly store = inject(InMemoryStore);

  listForUser(userId: string): Observable<Trip[]> {
    return this.store.data$.pipe(
      map((d) => {
        const tripIds = new Set(
          d.members.filter((m) => m.userId === userId).map((m) => m.tripId),
        );
        return d.trips.filter((t) => tripIds.has(t.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }),
    );
  }

  getById(tripId: string): Observable<Trip | undefined> {
    return this.store.data$.pipe(map((d) => d.trips.find((t) => t.id === tripId)));
  }

  create(dto: CreateTripDto, organizerId: string): Observable<Trip> {
    const d = this.store.snapshot();
    const user = d.users.find((u) => u.id === organizerId);
    const trip: Trip = {
      id: newId(),
      ...dto,
      organizerId,
      createdAt: new Date().toISOString(),
    };
    const member: TripMember = {
      tripId: trip.id,
      userId: organizerId,
      displayName: user?.displayName ?? 'Organizer',
      avatarUrl: user?.avatarUrl,
      joinedAt: new Date().toISOString(),
      isOrganizer: true,
    };
    const token = newId().slice(0, 12);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    this.store.update((data) => {
      data.trips.push(trip);
      data.members.push(member);
      data.invites.push({
        tripId: trip.id,
        token,
        expiresAt: expires.toISOString(),
        createdAt: new Date().toISOString(),
      });
    });
    return of(trip).pipe(switchMap((t) => delay(t)));
  }

  update(tripId: string, patch: Partial<Trip>): Observable<Trip> {
    let updated!: Trip;
    this.store.update((d) => {
      const idx = d.trips.findIndex((t) => t.id === tripId);
      if (idx >= 0) {
        d.trips[idx] = { ...d.trips[idx], ...patch };
        updated = d.trips[idx];
      }
    });
    return of(updated).pipe(switchMap((t) => delay(t)));
  }
}
