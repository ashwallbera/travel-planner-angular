import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Trip } from '../../../../core/models';
import { TRIP_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { validateDateRange } from '../../../../core/utils/date-range.validator';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { CoverPhotoPicker } from '../cover-photo-picker/cover-photo-picker';

@Component({
  selector: 'app-trip-edit-form',
  standalone: true,
  imports: [FormsModule, CoverPhotoPicker],
  templateUrl: './trip-edit-form.html',
  styleUrl: './trip-edit-form.scss',
})
export class TripEditForm {
  readonly trip = input.required<Trip>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  private readonly trips = inject(TRIP_REPOSITORY);
  private readonly ctx = inject(TripContextService);

  readonly error = signal('');

  name = '';
  destination = '';
  startDate = '';
  endDate = '';
  coverPhotoUrl?: string;

  constructor() {
    effect(() => {
      const t = this.trip();
      this.name = t.name;
      this.destination = t.destination ?? '';
      this.startDate = t.startDate ?? '';
      this.endDate = t.endDate ?? '';
      this.coverPhotoUrl = t.coverPhotoUrl;
    });
  }

  save(): void {
    this.error.set('');
    if (!this.name.trim()) {
      this.error.set('Trip name is required.');
      return;
    }
    const dateCheck = validateDateRange(this.startDate || undefined, this.endDate || undefined);
    if (!dateCheck.valid) {
      this.error.set(dateCheck.message ?? 'Invalid dates.');
      return;
    }
    this.trips
      .update(this.trip().id, {
        name: this.name.trim(),
        destination: this.destination.trim() || undefined,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
        coverPhotoUrl: this.coverPhotoUrl,
      })
      .subscribe(() => {
        this.ctx.reload();
        this.saved.emit();
      });
  }
}
