import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Tile {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-quick-access-tiles',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quick-access-tiles.html',
  styleUrl: './quick-access-tiles.scss',
})
export class QuickAccessTiles {
  readonly tripId = input.required<string>();

  tiles(): Tile[] {
    const id = this.tripId();
    return [
      { label: 'Itinerary', path: `/trips/${id}/itinerary`, icon: '📅' },
      { label: 'Budget', path: `/trips/${id}/budget`, icon: '💰' },
      { label: 'Diary', path: `/trips/${id}/diary`, icon: '📔' },
      { label: 'Pocket', path: `/trips/${id}/pocket`, icon: '🎫' },
      { label: 'Polls', path: `/trips/${id}/polls`, icon: '🗳️' },
      { label: 'Where to Eat', path: `/trips/${id}/food`, icon: '🍽️' },
    ];
  }
}
