import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { MEMBER_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { InvitePanel } from '../../components/invite-panel/invite-panel';
import { MemberList } from '../../components/member-list/member-list';

@Component({
  selector: 'app-trip-settings-page',
  standalone: true,
  imports: [PageHeader, InvitePanel, MemberList],
  templateUrl: './trip-settings-page.html',
  styleUrl: './trip-settings-page.scss',
})
export class TripSettingsPage {
  readonly ctx = inject(TripContextService);
  private readonly members = inject(MEMBER_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  readonly memberList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.members.listMembers(id)),
    ),
    { initialValue: [] },
  );

  remove(userId: string): void {
    const tripId = this.ctx.tripId();
    if (!tripId) return;
    if (!confirm('Remove this member? They will lose access to all trip content.')) return;
    this.members.removeMember(tripId, userId).subscribe();
  }

  organizerId(): string {
    return this.ctx.trip()?.organizerId ?? '';
  }

  currentUserId(): string {
    return this.auth.currentUser()?.id ?? '';
  }
}
