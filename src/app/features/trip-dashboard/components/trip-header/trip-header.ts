import { Component, input } from '@angular/core';
import type { Trip } from '../../../../core/models';
import { TripCountdown } from '../../../../shared/components/trip-countdown/trip-countdown';

@Component({
  selector: 'app-trip-header',
  standalone: true,
  imports: [TripCountdown],
  templateUrl: './trip-header.html',
  styleUrl: './trip-header.scss',
})
export class TripHeader {
  readonly trip = input.required<Trip>();
}
