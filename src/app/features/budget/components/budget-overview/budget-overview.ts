import { Component, input } from '@angular/core';
import type { CurrencyCode } from '../../../../core/models';
import { formatMoney } from '../../../../core/utils/currency.utils';
import {
  getBudgetProgressPercent,
  getBudgetProgressState,
} from '../../../../core/utils/budget-progress.utils';

@Component({
  selector: 'app-budget-overview',
  standalone: true,
  templateUrl: './budget-overview.html',
  styleUrl: './budget-overview.scss',
})
export class BudgetOverview {
  readonly spent = input.required<number>();
  readonly limit = input.required<number>();
  readonly currency = input.required<CurrencyCode>();

  percent(): number {
    return getBudgetProgressPercent(this.spent(), this.limit());
  }

  state(): string {
    return getBudgetProgressState(this.spent(), this.limit());
  }

  spentLabel(): string {
    return formatMoney(this.spent(), this.currency());
  }

  limitLabel(): string {
    return formatMoney(this.limit(), this.currency());
  }
}
