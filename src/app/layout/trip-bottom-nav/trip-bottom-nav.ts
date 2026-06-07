import { Component, input, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-trip-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './trip-bottom-nav.html',
  styleUrl: './trip-bottom-nav.scss',
})
export class TripBottomNav {
  readonly tripId = input.required<string>();
  readonly moreOpen = model(false);

  readonly primaryTabs = [
    { label: 'Home', path: 'dashboard', icon: '🏠' },
    { label: 'Plan', path: 'itinerary', icon: '📅' },
    { label: 'Budget', path: 'budget', icon: '💰' },
    { label: 'Polls', path: 'polls', icon: '🗳️' },
  ] as const;

  readonly moreLinks = [
    { label: 'Pocket', path: 'pocket', icon: '🎫' },
    { label: 'Packing', path: 'packing', icon: '🎒' },
    { label: 'Diary', path: 'diary', icon: '📔' },
    { label: 'Eat', path: 'food', icon: '🍽️' },
    { label: 'Changelog', path: 'changelog', icon: '📜' },
    { label: 'Summary', path: 'summary', icon: '✨' },
    { label: 'Members', path: 'members', icon: '👥' },
  ] as const;

  closeMore(): void {
    this.moreOpen.set(false);
  }
}
