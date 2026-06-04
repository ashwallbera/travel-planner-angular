import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { TripCard } from '../../components/trip-card/trip-card';
import { TripFacade } from '../../services/trip-facade.service';

@Component({
  selector: 'app-trip-list-page',
  standalone: true,
  imports: [RouterLink, PageHeader, EmptyState, TripCard],
  templateUrl: './trip-list-page.html',
  styleUrl: './trip-list-page.scss',
})
export class TripListPage {
  private readonly facade = inject(TripFacade);
  readonly trips = toSignal(this.facade.list(), { initialValue: [] });
}
