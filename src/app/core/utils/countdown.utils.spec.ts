import { describe, expect, it } from 'vitest';
import { getTripCountdown } from './countdown.utils';

describe('getTripCountdown', () => {
  it('returns no_dates when dates missing', () => {
    expect(getTripCountdown(undefined, undefined)).toEqual({
      state: 'no_dates',
      label: 'Set travel dates',
    });
  });

  it('returns upcoming when before start', () => {
    const result = getTripCountdown('2099-01-01', '2099-01-07', new Date('2098-12-01'));
    expect(result.state).toBe('upcoming');
    expect(result.daysRemaining).toBeGreaterThan(0);
  });
});
