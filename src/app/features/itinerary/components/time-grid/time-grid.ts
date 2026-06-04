import { Component, input, output } from '@angular/core';
import type { Activity, CurrencyCode } from '../../../../core/models';
import {
  assignOverlapColumns,
  getActivityEndMinutes,
  maxOverlapColumns,
  timeToMinutes,
  type TimeRange,
  GRID_START_HOUR,
} from '../../../../core/utils/time.utils';
import { ActivityBlock } from '../activity-block/activity-block';

@Component({
  selector: 'app-time-grid',
  standalone: true,
  imports: [ActivityBlock],
  templateUrl: './time-grid.html',
  styleUrl: './time-grid.scss',
})
export class TimeGrid {
  readonly activities = input.required<Activity[]>();
  readonly currency = input<CurrencyCode>('PHP');
  readonly selectActivity = output<Activity>();

  readonly hours = Array.from({ length: 24 - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);

  layoutForDay(): { activity: Activity; column: number; totalColumns: number }[] {
    const acts = this.activities();
    const ranges: TimeRange[] = acts.map((a) => ({
      id: a.id,
      start: timeToMinutes(a.startTime),
      end: getActivityEndMinutes(a.startTime, a.endTime),
    }));
    const cols = assignOverlapColumns(ranges);
    const total = maxOverlapColumns(ranges);
    return acts.map((a) => ({
      activity: a,
      column: cols.get(a.id) ?? 0,
      totalColumns: total,
    }));
  }
}
