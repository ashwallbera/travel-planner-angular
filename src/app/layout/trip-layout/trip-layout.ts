import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TripContextService } from '../../core/services/trip-context.service';
import { TripBottomNav } from '../trip-bottom-nav/trip-bottom-nav';

@Component({
  selector: 'app-trip-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TripBottomNav],
  providers: [TripContextService],
  templateUrl: './trip-layout.html',
  styleUrl: './trip-layout.scss',
})
export class TripLayout {
  readonly ctx = inject(TripContextService);
  readonly moreMenuOpen = signal(false);
}
