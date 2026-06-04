import type { CurrencyCode } from '../models';

const SYMBOLS: Record<CurrencyCode, string> = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const symbol = SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
