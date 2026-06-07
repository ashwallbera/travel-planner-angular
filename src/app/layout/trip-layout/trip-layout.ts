import { Component, inject, OnInit, signal } from '@angular/core';
import { take } from 'rxjs';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { TripContextService } from '../../core/services/trip-context.service';
import { TripBottomNav } from '../trip-bottom-nav/trip-bottom-nav';
import { QuickAddFab } from '../../shared/components/quick-add-fab/quick-add-fab';
import { QuickAddSheet } from '../../shared/components/quick-add-sheet/quick-add-sheet';
import { NotificationToast } from '../../shared/components/notification-toast/notification-toast';
import { LateJoinerOnboarding } from '../../features/members/components/late-joiner-onboarding/late-joiner-onboarding';
import { MEMBER_REPOSITORY } from '../../core/tokens/repository.tokens';
import { MockAuthService } from '../../data/mock/mock-auth.service';

@Component({
  selector: 'app-trip-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TripBottomNav,
    QuickAddFab,
    QuickAddSheet,
    NotificationToast,
    LateJoinerOnboarding,
  ],
  providers: [TripContextService],
  templateUrl: './trip-layout.html',
  styleUrl: './trip-layout.scss',
})
export class TripLayout implements OnInit {
  readonly ctx = inject(TripContextService);
  private readonly members = inject(MEMBER_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  readonly moreMenuOpen = signal(false);
  readonly quickAddOpen = signal(false);
  readonly showOnboarding = signal(false);

  ngOnInit(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user) return;
    this.members
      .needsOnboarding(tripId, user.id)
      .pipe(take(1))
      .subscribe((needs) => this.showOnboarding.set(needs));
  }

  dismissOnboarding(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (tripId && user) {
      this.members.markOnboardingSeen(tripId, user.id).subscribe();
    }
    this.showOnboarding.set(false);
  }
}
