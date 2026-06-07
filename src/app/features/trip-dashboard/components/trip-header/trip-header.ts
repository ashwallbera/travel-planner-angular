import { Component, input, signal } from '@angular/core';
import type { Trip } from '../../../../core/models';
import { formatTripDestination, formatTripDateRange } from '../../../../core/models';
import { TripCountdown } from '../../../../shared/components/trip-countdown/trip-countdown';
import { TripEditForm } from '../../../trips/components/trip-edit-form/trip-edit-form';

@Component({
  selector: 'app-trip-header',
  standalone: true,
  imports: [TripCountdown, TripEditForm],
  templateUrl: './trip-header.html',
  styleUrl: './trip-header.scss',
})
export class TripHeader {
  readonly trip = input.required<Trip>();
  readonly editing = signal(false);

  destination(): string {
    return formatTripDestination(this.trip());
  }

  dateRange(): string {
    return formatTripDateRange(this.trip());
  }
}
