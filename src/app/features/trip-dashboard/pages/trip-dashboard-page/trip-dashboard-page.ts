import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { MEMBER_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MemberAvatarStack } from '../../../../shared/components/member-avatar-stack/member-avatar-stack';
import { QuickAccessTiles } from '../../components/quick-access-tiles/quick-access-tiles';
import { TripHeader } from '../../components/trip-header/trip-header';

@Component({
  selector: 'app-trip-dashboard-page',
  standalone: true,
  imports: [TripHeader, QuickAccessTiles, MemberAvatarStack],
  templateUrl: './trip-dashboard-page.html',
  styleUrl: './trip-dashboard-page.scss',
})
export class TripDashboardPage {
  readonly ctx = inject(TripContextService);
  private readonly membersRepo = inject(MEMBER_REPOSITORY);

  readonly memberList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.membersRepo.listMembers(id)),
    ),
    { initialValue: [] },
  );
}
