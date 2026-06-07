import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quick-add-fab',
  standalone: true,
  templateUrl: './quick-add-fab.html',
  styleUrl: './quick-add-fab.scss',
})
export class QuickAddFab {
  readonly open = input(false);
  readonly clicked = output<void>();
}
