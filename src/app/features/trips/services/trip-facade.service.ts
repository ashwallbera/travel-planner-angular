import { inject, Injectable } from '@angular/core';
import type { CreateTripDto, Trip } from '../../../core/models';
import { TRIP_REPOSITORY } from '../../../core/tokens/repository.tokens';
import { MockAuthService } from '../../../data/mock/mock-auth.service';

@Injectable({ providedIn: 'root' })
export class TripFacade {
  private readonly trips = inject(TRIP_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  list() {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');
    return this.trips.listForUser(user.id);
  }

  create(dto: CreateTripDto) {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');
    return this.trips.create(dto, user.id);
  }

  getById(id: string) {
    return this.trips.getById(id);
  }
}
