import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import type { Trip } from '../models';
import { TRIP_REPOSITORY } from '../tokens/repository.tokens';

@Injectable()
export class TripContextService {
  private readonly trips = inject(TRIP_REPOSITORY);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  readonly trip = signal<Trip | null>(null);
  readonly tripId = signal<string | null>(null);
  readonly loading = signal(true);

  constructor() {
    const paramRoute = this.resolveTripParamRoute(this.route);

    paramRoute.paramMap
      .pipe(
        map((p) => p.get('tripId')),
        filter((id): id is string => !!id),
        distinctUntilChanged(),
        switchMap((id) => {
          this.tripId.set(id);
          this.loading.set(true);
          return this.trips.getById(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((t) => {
        this.trip.set(t ?? null);
        this.loading.set(false);
      });
  }

  reload(): void {
    const id = this.tripId();
    if (!id) return;
    this.loading.set(true);
    this.trips.getById(id).subscribe((t) => {
      this.trip.set(t ?? null);
      this.loading.set(false);
    });
  }

  private resolveTripParamRoute(route: ActivatedRoute): ActivatedRoute {
    let current: ActivatedRoute | null = route;
    while (current) {
      if (current.snapshot.paramMap.has('tripId')) {
        return current;
      }
      current = current.parent;
    }
    return route;
  }
}
