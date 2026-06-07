import type { BudgetEntry } from '../models';

export interface MemberShare {
  userId: string;
  owed: number;
  paid: number;
  net: number;
}

export interface SettlementTransfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export function computeMemberShares(
  entries: BudgetEntry[],
  memberIds: string[],
): MemberShare[] {
  const shares = new Map<string, MemberShare>();
  for (const id of memberIds) {
    shares.set(id, { userId: id, owed: 0, paid: 0, net: 0 });
  }

  for (const entry of entries) {
    const covered = entry.coveredBy?.length ? entry.coveredBy : memberIds;
    if (!covered.length) continue;
    const perPerson = entry.amount / covered.length;
    for (const uid of covered) {
      const s = shares.get(uid);
      if (s) s.owed += perPerson;
    }
    if (entry.payerId) {
      const payer = shares.get(entry.payerId);
      if (payer) payer.paid += entry.amount;
    }
  }

  return [...shares.values()].map((s) => ({
    ...s,
    net: Math.round((s.paid - s.owed) * 100) / 100,
  }));
}

export function simplifySettlements(shares: MemberShare[]): SettlementTransfer[] {
  const debtors = shares.filter((s) => s.net < -0.01).map((s) => ({ ...s }));
  const creditors = shares.filter((s) => s.net > 0.01).map((s) => ({ ...s }));
  const transfers: SettlementTransfer[] = [];

  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const d = debtors[di];
    const c = creditors[ci];
    const amount = Math.round(Math.min(-d.net, c.net) * 100) / 100;
    if (amount > 0) {
      transfers.push({ fromUserId: d.userId, toUserId: c.userId, amount });
      d.net += amount;
      c.net -= amount;
    }
    if (Math.abs(d.net) < 0.01) di++;
    if (Math.abs(c.net) < 0.01) ci++;
  }
  return transfers;
}
