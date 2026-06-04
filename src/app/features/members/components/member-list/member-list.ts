import { Component, input, output } from '@angular/core';
import type { TripMember } from '../../../../core/models';
import { MemberRow } from '../member-row/member-row';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberRow],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
})
export class MemberList {
  readonly members = input.required<TripMember[]>();
  readonly currentUserId = input.required<string>();
  readonly organizerId = input.required<string>();
  readonly removeMember = output<string>();

  canRemove(m: TripMember): boolean {
    return this.currentUserId() === this.organizerId() && !m.isOrganizer;
  }
}
