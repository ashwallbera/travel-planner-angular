import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import {
  POCKET_TYPE_LABELS,
  type PocketItem,
  type PocketItemType,
} from '../../../../core/models';
import { POCKET_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { formatMoney } from '../../../../core/utils/currency.utils';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { PocketBudgetSyncService } from '../../services/pocket-budget-sync.service';

@Component({
  selector: 'app-pocket-page',
  standalone: true,
  imports: [FormsModule, PageHeader, EmptyState],
  templateUrl: './pocket-page.html',
  styleUrl: './pocket-page.scss',
})
export class PocketPage {
  readonly ctx = inject(TripContextService);
  private readonly pocket = inject(POCKET_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly budgetSync = inject(PocketBudgetSyncService);

  readonly types = Object.keys(POCKET_TYPE_LABELS) as PocketItemType[];
  readonly typeLabels = POCKET_TYPE_LABELS;

  showForm = signal(false);
  selected = signal<PocketItem | null>(null);
  type: PocketItemType = 'flight';
  label = '';
  useDate = '';
  reference = '';
  amount?: number;
  attachmentUrl?: string;
  attachmentName?: string;

  readonly items = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.pocket.list(id)),
    ),
    { initialValue: [] },
  );

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const ok = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
    if (!ok) {
      alert('Only JPG, PNG, and PDF are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.attachmentUrl = reader.result as string;
      this.attachmentName = file.name;
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.label.trim() || !this.useDate) return;
    this.pocket
      .create({
        tripId,
        type: this.type,
        label: this.label.trim(),
        useDate: this.useDate,
        reference: this.reference || undefined,
        amount: this.amount,
        attachmentUrl: this.attachmentUrl,
        attachmentName: this.attachmentName,
        addedBy: user.id,
        addedByName: user.displayName,
      })
      .subscribe((item) => {
        this.budgetSync.syncItem(item);
        this.showForm.set(false);
      });
  }

  updateAmount(item: PocketItem, amount: number): void {
    this.pocket.update(item.id, { amount }).subscribe((updated) => {
      this.budgetSync.syncItem(updated);
      this.selected.set(updated);
    });
  }

  deleteItem(item: PocketItem): void {
    const msg = item.amount
      ? 'Delete this item and its linked budget entry?'
      : 'Delete this item?';
    if (!confirm(msg)) return;
    this.budgetSync.removeForItem(item.id);
    this.pocket.delete(item.id).subscribe(() => this.selected.set(null));
  }

  format(amount: number): string {
    return formatMoney(amount, this.ctx.trip()?.currency ?? 'PHP');
  }
}
