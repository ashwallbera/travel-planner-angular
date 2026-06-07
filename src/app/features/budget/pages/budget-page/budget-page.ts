import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import {
  BUDGET_CATEGORY_LABELS,
  type BudgetCategory,
  type BudgetEntry,
} from '../../../../core/models';
import {
  BUDGET_REPOSITORY,
  MEMBER_REPOSITORY,
} from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { ChangelogService } from '../../../../core/services/changelog.service';
import { formatMoney } from '../../../../core/utils/currency.utils';
import {
  computeMemberShares,
  simplifySettlements,
} from '../../../../core/utils/settlement-calculator';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { BudgetOverview } from '../../components/budget-overview/budget-overview';
import { AuditTrailFeed } from '../../../../shared/components/audit-trail-feed/audit-trail-feed';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [FormsModule, PageHeader, BudgetOverview, AuditTrailFeed, ConfirmDialog],
  templateUrl: './budget-page.html',
  styleUrl: './budget-page.scss',
})
export class BudgetPage {
  readonly Math = Math;
  readonly ctx = inject(TripContextService);
  private readonly budget = inject(BUDGET_REPOSITORY);
  private readonly members = inject(MEMBER_REPOSITORY);
  private readonly auth = inject(MockAuthService);
  private readonly changelog = inject(ChangelogService);

  readonly labels = BUDGET_CATEGORY_LABELS;
  readonly categories = Object.keys(BUDGET_CATEGORY_LABELS) as BudgetCategory[];

  readonly tab = signal<'entries' | 'settlement'>('entries');
  readonly paidFilter = signal<'all' | 'paid' | 'unpaid'>('all');
  showForm = signal(false);
  detailEntry = signal<BudgetEntry | null>(null);
  confirmDelete = signal<BudgetEntry | null>(null);

  category: BudgetCategory = 'food_drinks';
  label = '';
  amount = 0;
  budgetLimitInput = 0;
  coveredBy: string[] = [];
  payerId = '';
  receiptDataUrl = '';

  readonly entries = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.budget.list(id)),
    ),
    { initialValue: [] },
  );

  readonly memberList = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.members.listMembers(id)),
    ),
    { initialValue: [] },
  );

  readonly spent = computed(() => this.entries().reduce((s, e) => s + e.amount, 0));

  readonly filteredEntries = computed(() => {
    const f = this.paidFilter();
    return this.entries().filter((e) => {
      if (f === 'paid') return e.paid;
      if (f === 'unpaid') return !e.paid;
      return true;
    });
  });

  readonly settlements = computed(() => {
    const ids = this.memberList().map((m) => m.userId);
    const shares = computeMemberShares(this.entries(), ids);
    return { shares, transfers: simplifySettlements(shares) };
  });

  saveLimit(): void {
    const id = this.ctx.tripId();
    if (!id) return;
    this.budget.setTripBudgetLimit(id, this.budgetLimitInput).subscribe(() => this.ctx.reload());
  }

  openAdd(): void {
    this.coveredBy = this.memberList().map((m) => m.userId);
    this.payerId = this.auth.currentUser()?.id ?? '';
    this.showForm.set(true);
  }

  toggleCover(userId: string): void {
    const set = new Set(this.coveredBy);
    if (set.has(userId)) set.delete(userId);
    else set.add(userId);
    this.coveredBy = [...set];
  }

  addEntry(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.label.trim()) return;
    this.budget
      .create({
        tripId,
        category: this.category,
        label: this.label.trim(),
        amount: this.amount,
        date: new Date().toISOString().slice(0, 10),
        addedBy: user.id,
        addedByName: user.displayName,
        source: { type: 'manual' },
        coveredBy: this.coveredBy.length ? [...this.coveredBy] : undefined,
        payerId: this.payerId || undefined,
        receiptUrl: this.receiptDataUrl || undefined,
        paid: !!this.receiptDataUrl,
      })
      .subscribe(() => {
        this.changelog.log(
          tripId,
          'budget_entry_created',
          `Added expense "${this.label.trim()}"`,
          user.id,
          user.displayName,
        );
        this.showForm.set(false);
        this.label = '';
        this.amount = 0;
        this.receiptDataUrl = '';
      });
  }

  togglePaid(entry: BudgetEntry): void {
    const user = this.auth.currentUser();
    if (!user) return;
    if (!entry.paid && !entry.receiptUrl) {
      alert('Upload a receipt before marking as paid.');
      return;
    }
    this.budget
      .update(entry.id, {
        paid: !entry.paid,
        addedBy: user.id,
        addedByName: user.displayName,
      })
      .subscribe((updated) => {
        if (updated.paid) {
          this.changelog.log(
            entry.tripId,
            'budget_entry_paid',
            `Marked "${entry.label}" as paid`,
            user.id,
            user.displayName,
          );
        }
      });
  }

  onReceiptFile(event: Event, entry?: BudgetEntry): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (entry) {
        const user = this.auth.currentUser();
        if (!user) return;
        this.budget
          .update(entry.id, { receiptUrl: url, addedBy: user.id, addedByName: user.displayName })
          .subscribe();
      } else {
        this.receiptDataUrl = url;
      }
    };
    reader.readAsDataURL(file);
  }

  requestDelete(e: BudgetEntry): void {
    this.confirmDelete.set(e);
  }

  confirmDeleteEntry(): void {
    const e = this.confirmDelete();
    if (!e) return;
    this.budget.delete(e.id).subscribe(() => {
      this.changelog.log(
        e.tripId,
        'budget_entry_deleted',
        `Deleted expense "${e.label}"`,
        e.addedBy,
        e.addedByName,
      );
      this.confirmDelete.set(null);
    });
  }

  deleteMessage(): string {
    const e = this.confirmDelete();
    if (!e) return '';
    return `Delete "${e.label}"? This may affect settlement balances.`;
  }

  memberName(userId: string): string {
    return this.memberList().find((m) => m.userId === userId)?.displayName ?? userId;
  }

  format(amount: number): string {
    return formatMoney(amount, this.ctx.trip()?.currency ?? 'PHP');
  }

  byCategory(cat: BudgetCategory): BudgetEntry[] {
    return this.filteredEntries().filter((e) => e.category === cat);
  }

  categorySpent(cat: BudgetCategory): number {
    return this.byCategory(cat).reduce((s, e) => s + e.amount, 0);
  }

  sharePerPerson(entry: BudgetEntry): number {
    const covered = entry.coveredBy?.length ? entry.coveredBy.length : this.memberList().length;
    return covered ? Math.round((entry.amount / covered) * 100) / 100 : entry.amount;
  }
}
