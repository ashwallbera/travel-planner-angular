import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import type { Activity } from '../../../../core/models';
import { hasTripDates } from '../../../../core/models';
import {
  ACTIVITY_REPOSITORY,
  MEMBER_REPOSITORY,
} from '../../../../core/tokens/repository.tokens';
import { AuditTrailService } from '../../../../core/services/audit-trail.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChangelogService } from '../../../../core/services/changelog.service';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { eachDayInRange } from '../../../../core/utils/date.utils';
import {
  getActivityEndMinutes,
  timeToMinutes,
} from '../../../../core/utils/time.utils';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { AuditTrailFeed } from '../../../../shared/components/audit-trail-feed/audit-trail-feed';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { DayStrip } from '../../components/day-strip/day-strip';
import { TimeGrid } from '../../components/time-grid/time-grid';
import { ItineraryBudgetSyncService } from '../../services/itinerary-budget-sync.service';

@Component({
  selector: 'app-itinerary-page',
  standalone: true,
  imports: [
    FormsModule,
    PageHeader,
    DayStrip,
    TimeGrid,
    AuditTrailFeed,
    ConfirmDialog,
  ],
  templateUrl: './itinerary-page.html',
  styleUrl: './itinerary-page.scss',
})
export class ItineraryPage {
  readonly ctx = inject(TripContextService);
  private readonly activities = inject(ACTIVITY_REPOSITORY);
  private readonly members = inject(MEMBER_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly budgetSync = inject(ItineraryBudgetSyncService);
  private readonly audit = inject(AuditTrailService);
  private readonly notifications = inject(NotificationService);
  private readonly changelog = inject(ChangelogService);

  readonly selectedDay = signal('');
  readonly showForm = signal(false);
  readonly selectedActivity = signal<Activity | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly padlockPrompt = signal<Activity | null>(null);
  readonly pendingMove = signal<{ activityId: string; startTime: string } | null>(null);
  readonly draggingId = signal<string | null>(null);

  name = '';
  startTime = '09:00';
  endTime = '';
  location = '';
  notes = '';
  estimatedCost?: number;

  readonly hasDates = computed(() => {
    const t = this.ctx.trip();
    return t ? hasTripDates(t) : false;
  });

  readonly days = computed(() => {
    const t = this.ctx.trip();
    if (!t || !hasTripDates(t)) return [];
    return eachDayInRange(t.startDate!, t.endDate!);
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
    const day = this.selectedDay() || new Date().toISOString().slice(0, 10);
    const payload = {
      tripId,
      name: this.name.trim(),
      date: day,
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
      this.activities
        .update(id, payload, this.audit.buildEntry(user.id, user.displayName, 'Updated activity'))
        .subscribe((a) => {
          this.budgetSync.syncActivity(a);
          this.changelog.log(tripId, 'activity_updated', `Updated "${a.name}"`, user.id, user.displayName);
          this.showForm.set(false);
        });
    } else {
      this.activities.create(payload).subscribe((a) => {
        this.budgetSync.syncActivity(a);
        this.changelog.log(tripId, 'activity_created', `Added "${a.name}"`, user.id, user.displayName);
        this.showForm.set(false);
      });
    }
  }

  deleteActivity(id: string): void {
    if (!confirm('Delete this activity?')) return;
    const user = this.auth.currentUser();
    this.budgetSync.removeForActivity(id);
    this.activities
      .delete(id, user ? this.audit.buildEntry(user.id, user.displayName, 'Deleted activity') : undefined)
      .subscribe(() => this.selectedActivity.set(null));
  }

  viewActivity(a: Activity): void {
    this.selectedActivity.set(a);
  }

  onDragStart(activityId: string): void {
    this.draggingId.set(activityId);
  }

  onDrop(startTime: string): void {
    const activityId = this.draggingId();
    this.draggingId.set(null);
    if (!activityId) return;

    const activity = this.allActivities().find((a) => a.id === activityId);
    if (!activity) return;

    if (activity.isPadlocked) {
      this.padlockPrompt.set(activity);
      this.pendingMove.set({ activityId, startTime });
      return;
    }

    this.performMove(activity, startTime);
  }

  confirmPadlockMove(): void {
    const activity = this.padlockPrompt();
    const pending = this.pendingMove();
    const user = this.auth.currentUser();
    if (!activity || !pending || !user) return;
    this.performMove(activity, pending.startTime);
    this.padlockPrompt.set(null);
    this.pendingMove.set(null);
  }

  cancelPadlockMove(): void {
    this.padlockPrompt.set(null);
    this.pendingMove.set(null);
  }

  private performMove(activity: Activity, startTime: string): void {
    const user = this.auth.currentUser();
    const tripId = this.ctx.tripId();
    if (!user || !tripId) return;

    const auditEntry = this.audit.buildEntry(
      user.id,
      user.displayName,
      'Moved activity',
      `Time changed to ${startTime}`,
    );

    this.activities
      .move(activity.id, activity.date, startTime, activity.endTime, auditEntry)
      .subscribe((updated) => {
        this.changelog.log(
          tripId,
          'activity_moved',
          `Moved "${updated.name}" to ${startTime}`,
          user.id,
          user.displayName,
        );
        this.checkOverlapNotify(updated);
      });
  }

  private checkOverlapNotify(moved: Activity): void {
    const tripId = this.ctx.tripId();
    if (!tripId) return;

    const sameDay = this.allActivities().filter(
      (a) => a.id !== moved.id && a.date === moved.date,
    );
    const start = timeToMinutes(moved.startTime);
    const end = getActivityEndMinutes(moved.startTime, moved.endTime);

    const overlaps = sameDay.filter((a) => {
      const aStart = timeToMinutes(a.startTime);
      const aEnd = getActivityEndMinutes(a.startTime, a.endTime);
      return start < aEnd && aStart < end;
    });

    if (overlaps.length) {
      this.members.listMembers(tripId).subscribe((members) => {
        this.notifications.notifyTripMembers(
          tripId,
          members.map((m) => m.userId),
          'itinerary_overlap',
          'Schedule overlap',
          `"${moved.name}" overlaps with another activity today.`,
        );
      });
    }
  }
}
