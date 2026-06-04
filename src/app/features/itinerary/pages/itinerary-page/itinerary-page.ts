import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import type { Activity } from '../../../../core/models';
import { ACTIVITY_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { eachDayInRange } from '../../../../core/utils/date.utils';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { DayStrip } from '../../components/day-strip/day-strip';
import { TimeGrid } from '../../components/time-grid/time-grid';
import { ItineraryBudgetSyncService } from '../../services/itinerary-budget-sync.service';

@Component({
  selector: 'app-itinerary-page',
  standalone: true,
  imports: [FormsModule, PageHeader, DayStrip, TimeGrid],
  templateUrl: './itinerary-page.html',
  styleUrl: './itinerary-page.scss',
})
export class ItineraryPage {
  readonly ctx = inject(TripContextService);
  private readonly activities = inject(ACTIVITY_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly budgetSync = inject(ItineraryBudgetSyncService);

  readonly selectedDay = signal('');
  readonly showForm = signal(false);
  readonly selectedActivity = signal<Activity | null>(null);
  readonly editingId = signal<string | null>(null);

  name = '';
  startTime = '09:00';
  endTime = '';
  location = '';
  notes = '';
  estimatedCost?: number;

  readonly days = computed(() => {
    const t = this.ctx.trip();
    return t ? eachDayInRange(t.startDate, t.endDate) : [];
  });

  readonly allActivities = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.activities.list(id)),
    ),
    { initialValue: [] },
  );

  readonly dayActivities = computed(() =>
    this.allActivities().filter((a) => a.date === this.selectedDay()),
  );

  constructor() {
    effect(() => {
      const d = this.days();
      if (d.length && !this.selectedDay()) this.selectedDay.set(d[0]);
    });
  }

  openAdd(): void {
    this.editingId.set(null);
    this.name = '';
    this.startTime = '09:00';
    this.endTime = '';
    this.location = '';
    this.notes = '';
    this.estimatedCost = undefined;
    this.showForm.set(true);
  }

  openEdit(a: Activity): void {
    this.editingId.set(a.id);
    this.name = a.name;
    this.startTime = a.startTime;
    this.endTime = a.endTime ?? '';
    this.location = a.location ?? '';
    this.notes = a.notes ?? '';
    this.estimatedCost = a.estimatedCost;
    this.showForm.set(true);
    this.selectedActivity.set(null);
  }

  save(): void {
    const trip = this.ctx.trip();
    const user = this.auth.currentUser();
    const tripId = this.ctx.tripId();
    if (!trip || !user || !tripId || !this.name.trim()) return;
    const payload = {
      tripId,
      name: this.name.trim(),
      date: this.selectedDay(),
      startTime: this.startTime,
      endTime: this.endTime || undefined,
      location: this.location || undefined,
      notes: this.notes || undefined,
      estimatedCost: this.estimatedCost,
      addedBy: user.id,
      addedByName: user.displayName,
    };
    const id = this.editingId();
    if (id) {
      this.activities.update(id, payload).subscribe((a) => {
        this.budgetSync.syncActivity(a);
        this.showForm.set(false);
      });
    } else {
      this.activities.create(payload).subscribe((a) => {
        this.budgetSync.syncActivity(a);
        this.showForm.set(false);
      });
    }
  }

  deleteActivity(id: string): void {
    if (!confirm('Delete this activity?')) return;
    this.budgetSync.removeForActivity(id);
    this.activities.delete(id).subscribe(() => this.selectedActivity.set(null));
  }

  viewActivity(a: Activity): void {
    this.selectedActivity.set(a);
  }
}
