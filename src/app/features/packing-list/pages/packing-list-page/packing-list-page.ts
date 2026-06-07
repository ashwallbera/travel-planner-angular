import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { PACKING_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { ChangelogService } from '../../../../core/services/changelog.service';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { FormsModule } from '@angular/forms';
import type { PackingItem } from '../../../../core/models';

@Component({
  selector: 'app-packing-list-page',
  standalone: true,
  imports: [FormsModule, PageHeader, EmptyState],
  templateUrl: './packing-list-page.html',
  styleUrl: './packing-list-page.scss',
})
export class PackingListPage {
  readonly ctx = inject(TripContextService);
  private readonly packing = inject(PACKING_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly changelog = inject(ChangelogService);

  readonly filter = signal<'all' | 'claimed' | 'unclaimed'>('all');
  readonly showForm = signal(false);
  itemName = '';

  readonly items = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.packing.list(id)),
    ),
    { initialValue: [] },
  );

  filtered(): PackingItem[] {
    const f = this.filter();
    const list = this.items();
    if (f === 'claimed') return list.filter((i) => i.claimedBy);
    if (f === 'unclaimed') return list.filter((i) => !i.claimedBy);
    return list;
  }

  addItem(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.itemName.trim()) return;
    this.packing
      .create({
        tripId,
        name: this.itemName.trim(),
        addedBy: user.id,
        addedByName: user.displayName,
      })
      .subscribe((item) => {
        this.changelog.log(
          tripId,
          'packing_item_created',
          `Added packing item "${item.name}"`,
          user.id,
          user.displayName,
        );
        this.itemName = '';
        this.showForm.set(false);
      });
  }

  toggleClaim(item: PackingItem): void {
    const user = this.auth.currentUser();
    const tripId = this.ctx.tripId();
    if (!user || !tripId) return;

    if (item.claimedBy && item.claimedBy !== user.id) {
      if (!confirm(`${item.claimedByName} already claimed this. Take it over?`)) return;
    }

    if (item.claimedBy === user.id) {
      this.packing.unclaim(item.id).subscribe(() => {
        this.changelog.log(
          tripId,
          'packing_item_unclaimed',
          `Unclaimed "${item.name}"`,
          user.id,
          user.displayName,
        );
      });
    } else {
      this.packing.claim(item.id, user.id, user.displayName).subscribe(() => {
        this.changelog.log(
          tripId,
          'packing_item_claimed',
          `Claimed "${item.name}"`,
          user.id,
          user.displayName,
        );
      });
    }
  }

  deleteItem(item: PackingItem): void {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.packing.delete(item.id).subscribe();
  }
}
