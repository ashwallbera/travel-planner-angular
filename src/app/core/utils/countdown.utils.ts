import { parseDateOnly } from './date.utils';

export type CountdownState = 'upcoming' | 'ongoing' | 'past' | 'no_dates';

export interface CountdownResult {
  state: CountdownState;
  label: string;
  daysRemaining?: number;
}

export function getTripCountdown(
  startDate?: string,
  endDate?: string,
  now = new Date(),
): CountdownResult {
  if (!startDate?.trim() || !endDate?.trim()) {
    return { state: 'no_dates', label: 'Set travel dates' };
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  end.setHours(23, 59, 59, 999);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today > end) {
    return { state: 'past', label: 'Trip ended' };
  }
  if (today >= start && today <= end) {
    return { state: 'ongoing', label: 'Trip is ongoing' };
  }
  const ms = start.getTime() - today.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return {
    state: 'upcoming',
    label: days === 1 ? '1 day to go' : `${days} days to go`,
    daysRemaining: days,
  };
}
