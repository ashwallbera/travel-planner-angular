import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MEMBER_REPOSITORY } from '../../../../core/tokens/repository.tokens';

@Component({
  selector: 'app-invite-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './invite-panel.html',
  styleUrl: './invite-panel.scss',
})
export class InvitePanel implements OnInit {
  readonly tripId = input.required<string>();
  private readonly members = inject(MEMBER_REPOSITORY);

  readonly inviteUrl = signal('');
  readonly copied = signal(false);
  inviteEmail = '';
  invitePhone = '';

  ngOnInit(): void {
    this.refreshLink();
  }

  refreshLink(): void {
    this.members.getInvite(this.tripId()).subscribe((inv) => {
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      this.inviteUrl.set(`${base}/invite/${inv.token}`);
    });
  }

  regenerate(): void {
    this.members.regenerateInvite(this.tripId()).subscribe(() => this.refreshLink());
  }

  copyLink(): void {
    const url = this.inviteUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  sendInvite(): void {
    alert(`Mock invite sent to ${this.inviteEmail || this.invitePhone || '(no contact)'}`);
  }
}
