import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { CompanionBreakdown, CurrencyCode } from '../../../../core/models';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CompanionBreakdownComponent } from '../../components/companion-breakdown/companion-breakdown';
import { CoverPhotoPicker } from '../../components/cover-photo-picker/cover-photo-picker';
import { TripFacade } from '../../services/trip-facade.service';

@Component({
  selector: 'app-trip-create-page',
  standalone: true,
  imports: [FormsModule, PageHeader, CompanionBreakdownComponent, CoverPhotoPicker],
  templateUrl: './trip-create-page.html',
  styleUrl: './trip-create-page.scss',
})
export class TripCreatePage {
  private readonly facade = inject(TripFacade);
  private readonly router = inject(Router);

  readonly breakdown = viewChild(CompanionBreakdownComponent);

  name = '';
  destination = '';
  startDate = '';
  endDate = '';
  travelerCount = 2;
  currency: CurrencyCode = 'PHP';
  budgetLimit?: number;
  coverPhotoUrl?: string;
  companions: CompanionBreakdown = { adults: 2, seniors: 0, children: 0 };
  readonly error = signal('');

  submit(): void {
    this.error.set('');
    if (!this.name.trim()) {
      this.error.set('Trip name is required.');
      return;
    }
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.error.set('End date cannot be before start date.');
      return;
    }
    if (!this.breakdown()?.isValid()) {
      this.error.set(this.breakdown()?.validationMessage() ?? 'Invalid companion breakdown.');
      return;
    }
    this.facade
      .create({
        name: this.name.trim(),
        destination: this.destination.trim() || undefined,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
        coverPhotoUrl: this.coverPhotoUrl,
        currency: this.currency,
        travelerCount: this.travelerCount,
        companions: this.companions,
        budgetLimit: this.budgetLimit,
      })
      .subscribe((trip) => void this.router.navigate(['/trips', trip.id]));
  }
}
