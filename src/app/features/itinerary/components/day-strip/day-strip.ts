import { Component, input, model } from '@angular/core';
import { parseDateOnly } from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-day-strip',
  standalone: true,
  templateUrl: './day-strip.html',
  styleUrl: './day-strip.scss',
})
export class DayStrip {
  readonly days = input.required<string[]>();
  readonly selected = model.required<string>();

  label(day: string): string {
    return parseDateOnly(day).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}
