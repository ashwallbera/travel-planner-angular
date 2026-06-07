import { Injectable, inject } from '@angular/core';
import type { Poll, PollCategory } from '../models';
import {
  ACTIVITY_REPOSITORY,
  BUDGET_REPOSITORY,
  FOOD_SPOT_REPOSITORY,
  POCKET_REPOSITORY,
  TRIP_REPOSITORY,
} from '../tokens/repository.tokens';
import { ChangelogService } from './changelog.service';
import { MockAuthService } from '../../data/mock/mock-auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PollAutoPopulateService {
  private readonly trips = inject(TRIP_REPOSITORY);
  private readonly budget = inject(BUDGET_REPOSITORY);
  private readonly pocket = inject(POCKET_REPOSITORY);
  private readonly activities = inject(ACTIVITY_REPOSITORY);
  private readonly food = inject(FOOD_SPOT_REPOSITORY);
  private readonly changelog = inject(ChangelogService);
  private readonly auth = inject(MockAuthService);

  async populateFromPoll(poll: Poll, winningOptionId: string): Promise<void> {
    const option = poll.options.find((o) => o.id === winningOptionId);
    if (!option) return;

    const user = this.auth.currentUser();
    const label = `From Poll: ${poll.title}`;
    const tripId = poll.tripId;
    const category = poll.category ?? 'general';
    const today = new Date().toISOString().slice(0, 10);

    const trip = await firstValueFrom(this.trips.getById(tripId));
    if (!trip) return;

    const actorId = user?.id ?? poll.createdBy;
    const actorName = user?.displayName ?? poll.createdByName;

    switch (category) {
      case 'hotel':
        if (!trip.destination && option.label) {
          await firstValueFrom(this.trips.update(tripId, { destination: option.label }));
        }
        await firstValueFrom(
          this.pocket.create({
            tripId,
            type: 'accommodation',
            label: option.label,
            useDate: trip.startDate ?? today,
            amount: option.price,
            reference: option.link,
            addedBy: actorId,
            addedByName: actorName,
          }),
        );
        if (option.price) {
          await firstValueFrom(
            this.budget.syncFromSource({
              tripId,
              category: 'accommodation',
              label,
              amount: option.price,
              date: trip.startDate ?? today,
              addedBy: actorId,
              addedByName: actorName,
              sourceType: 'poll',
              refId: poll.id,
            }),
          );
        }
        break;

      case 'restaurant':
        await firstValueFrom(
          this.food.create({
            tripId,
            name: option.label,
            notes: option.notes,
            mealType: 'any',
            addedBy: actorId,
            addedByName: actorName,
          }),
        );
        if (option.price) {
          await firstValueFrom(
            this.budget.syncFromSource({
              tripId,
              category: 'food_drinks',
              label,
              amount: option.price,
              date: today,
              addedBy: actorId,
              addedByName: actorName,
              sourceType: 'poll',
              refId: poll.id,
            }),
          );
        }
        break;

      case 'activity':
        await firstValueFrom(
          this.activities.create({
            tripId,
            name: option.label,
            date: trip.startDate ?? today,
            startTime: '10:00',
            location: option.link,
            notes: option.notes,
            estimatedCost: option.price,
            addedBy: actorId,
            addedByName: actorName,
          }),
        );
        if (option.price) {
          await firstValueFrom(
            this.budget.syncFromSource({
              tripId,
              category: 'activities',
              label,
              amount: option.price,
              date: trip.startDate ?? today,
              addedBy: actorId,
              addedByName: actorName,
              sourceType: 'poll',
              refId: poll.id,
            }),
          );
        }
        break;

      case 'transport':
        await firstValueFrom(
          this.pocket.create({
            tripId,
            type: 'transport',
            label: option.label,
            useDate: trip.startDate ?? today,
            amount: option.price,
            reference: option.link,
            addedBy: actorId,
            addedByName: actorName,
          }),
        );
        if (option.price) {
          await firstValueFrom(
            this.budget.syncFromSource({
              tripId,
              category: 'transport',
              label,
              amount: option.price,
              date: trip.startDate ?? today,
              addedBy: actorId,
              addedByName: actorName,
              sourceType: 'poll',
              refId: poll.id,
            }),
          );
        }
        break;

      default:
        if (option.price) {
          await firstValueFrom(
            this.budget.syncFromSource({
              tripId,
              category: 'others',
              label,
              amount: option.price,
              date: today,
              addedBy: actorId,
              addedByName: actorName,
              sourceType: 'poll',
              refId: poll.id,
            }),
          );
        }
        break;
    }

    this.changelog.log(
      tripId,
      'poll_locked',
      `Poll "${poll.title}" locked — auto-populated ${categoryLabel(category)}`,
      actorId,
      actorName,
      { pollId: poll.id, optionId: winningOptionId },
    );
  }
}

function categoryLabel(cat: PollCategory): string {
  const map: Record<PollCategory, string> = {
    hotel: 'accommodation',
    restaurant: 'food spot',
    activity: 'itinerary',
    transport: 'pocket',
    general: 'budget',
    other: 'budget',
  };
  return map[cat];
}
