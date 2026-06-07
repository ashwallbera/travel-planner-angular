import { Component, input, output } from '@angular/core';
import type { Activity, CurrencyCode } from '../../../../core/models';
import {
  assignOverlapColumns,
  getActivityEndMinutes,
  maxOverlapColumns,
  timeToMinutes,
  type TimeRange,
  GRID_START_HOUR,
  minutesToTime,
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
  readonly dropAtTime = output<string>();
  readonly dragActivity = output<string>();

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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const ratio = y / rect.height;
    const totalMinutes = (24 - GRID_START_HOUR) * 60;
    const minutes = Math.round(ratio * totalMinutes) + GRID_START_HOUR * 60;
    const snapped = Math.round(minutes / 15) * 15;
    this.dropAtTime.emit(minutesToTime(snapped));
  }
}
