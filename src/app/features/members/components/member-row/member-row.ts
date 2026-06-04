import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import type { TripMember } from '../../../../core/models';

@Component({
  selector: 'app-member-row',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './member-row.html',
  styleUrl: './member-row.scss',
})
export class MemberRow {
  readonly member = input.required<TripMember>();
  readonly canRemove = input(false);
  readonly remove = output<void>();

  initials(): string {
    return this.member()
      .displayName.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
