import { describe, expect, it } from 'vitest';
import { computeMemberShares, simplifySettlements } from './settlement-calculator';
import type { BudgetEntry } from '../models';

describe('SettlementCalculator', () => {
  const entries: BudgetEntry[] = [
    {
      id: '1',
      tripId: 't1',
      category: 'food_drinks',
      label: 'Dinner',
      amount: 100,
      date: '2026-06-01',
      addedBy: 'u1',
      addedByName: 'A',
      coveredBy: ['u1', 'u2'],
      payerId: 'u1',
      paid: true,
    },
  ];

  it('computes equal shares', () => {
    const shares = computeMemberShares(entries, ['u1', 'u2']);
    const u1 = shares.find((s) => s.userId === 'u1')!;
    const u2 = shares.find((s) => s.userId === 'u2')!;
    expect(u1.owed).toBe(50);
    expect(u2.owed).toBe(50);
    expect(u1.paid).toBe(100);
  });

  it('simplifies settlement transfers', () => {
    const shares = computeMemberShares(entries, ['u1', 'u2']);
    const transfers = simplifySettlements(shares);
    expect(transfers).toEqual([{ fromUserId: 'u2', toUserId: 'u1', amount: 50 }]);
  });
});
