export type BudgetProgressState = 'normal' | 'warning' | 'critical';

export function getBudgetProgressState(spent: number, limit: number): BudgetProgressState {
  if (limit <= 0) return 'normal';
  const pct = (spent / limit) * 100;
  if (pct >= 100) return 'critical';
  if (pct >= 80) return 'warning';
  return 'normal';
}

export function getBudgetProgressPercent(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, (spent / limit) * 100);
}
