import { Component, input } from '@angular/core';
import { getTripCountdown } from '../../../core/utils/countdown.utils';

@Component({
  selector: 'app-trip-countdown',
  standalone: true,
  templateUrl: './trip-countdown.html',
  styleUrl: './trip-countdown.scss',
})
export class TripCountdown {
  readonly startDate = input<string>();
  readonly endDate = input<string>();

  label(): string {
    return getTripCountdown(this.startDate(), this.endDate()).label;
  }

  state(): string {
    return getTripCountdown(this.startDate(), this.endDate()).state;
  }
}
