import { Component, input, output } from '@angular/core';
import type { Activity } from '../../../../core/models';
import { formatMoney } from '../../../../core/utils/currency.utils';
import type { CurrencyCode } from '../../../../core/models';
import {
  getActivityDurationMinutes,
  GRID_START_HOUR,
  timeToMinutes,
} from '../../../../core/utils/time.utils';

@Component({
  selector: 'app-activity-block',
  standalone: true,
  templateUrl: './activity-block.html',
  styleUrl: './activity-block.scss',
})
export class ActivityBlock {
  readonly activity = input.required<Activity>();
  readonly currency = input<CurrencyCode>('PHP');
  readonly column = input(0);
  readonly totalColumns = input(1);
  readonly select = output<void>();
  readonly dragStart = output<string>();

  topPercent(): number {
    const start = timeToMinutes(this.activity().startTime) - GRID_START_HOUR * 60;
    const total = (24 - GRID_START_HOUR) * 60;
    return (start / total) * 100;
  }

  heightPercent(): number {
    const dur = getActivityDurationMinutes(
      this.activity().startTime,
      this.activity().endTime,
    );
    const total = (24 - GRID_START_HOUR) * 60;
    return (dur / total) * 100;
  }

  leftPercent(): number {
    return (this.column() / this.totalColumns()) * 100;
  }

  widthPercent(): number {
    return 100 / this.totalColumns();
  }

  costLabel(): string | null {
    const c = this.activity().estimatedCost;
    return c != null ? formatMoney(c, this.currency()) : null;
  }

  onDragStart(event: DragEvent): void {
    event.stopPropagation();
    const id = this.activity().id;
    event.dataTransfer?.setData('text/plain', id);
    this.dragStart.emit(id);
  }
}
