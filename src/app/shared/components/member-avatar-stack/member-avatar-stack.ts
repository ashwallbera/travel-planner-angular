import { Component, input } from '@angular/core';
import type { TripMember } from '../../../core/models';

@Component({
  selector: 'app-member-avatar-stack',
  standalone: true,
  templateUrl: './member-avatar-stack.html',
  styleUrl: './member-avatar-stack.scss',
})
export class MemberAvatarStack {
  readonly members = input.required<TripMember[]>();
  readonly maxVisible = input(5);

  initials(m: TripMember): string {
    return m.displayName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
