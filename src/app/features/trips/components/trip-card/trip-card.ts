import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Trip } from '../../../../core/models';
import { formatTripDestination, formatTripDateRange } from '../../../../core/models';
import { TripCountdown } from '../../../../shared/components/trip-countdown/trip-countdown';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [RouterLink, TripCountdown],
  templateUrl: './trip-card.html',
  styleUrl: './trip-card.scss',
})
export class TripCard {
  readonly trip = input.required<Trip>();

  destination(): string {
    return formatTripDestination(this.trip());
  }

  dateRange(): string {
    return formatTripDateRange(this.trip());
  }
}
