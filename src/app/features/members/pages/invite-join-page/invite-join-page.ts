import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MEMBER_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invite-join-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './invite-join-page.html',
  styleUrl: './invite-join-page.scss',
})
export class InviteJoinPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly members = inject(MEMBER_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  readonly error = signal('');
  readonly loading = signal(true);

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    const user = this.auth.currentUser();
    if (!token) {
      this.error.set('Invalid invite link.');
      this.loading.set(false);
      return;
    }
    if (!user) {
      void this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/invite/${token}` } });
      return;
    }
    this.members.joinByToken(token, user.id, user.displayName).subscribe({
      next: (tripId) => void this.router.navigate(['/trips', tripId]),
      error: (e) => {
        this.error.set(e.message ?? 'Could not join trip.');
        this.loading.set(false);
      },
    });
  }
}
