import { describe, expect, it } from 'vitest';
import { getTripCountdown } from './countdown.utils';

describe('getTripCountdown', () => {
  it('shows ongoing when today is in range', () => {
    const r = getTripCountdown('2026-06-01', '2026-06-10', new Date('2026-06-05'));
    expect(r.state).toBe('ongoing');
    expect(r.label).toBe('Trip is ongoing');
  });

  it('shows days to go before start', () => {
    const r = getTripCountdown('2026-06-10', '2026-06-15', new Date('2026-06-05'));
    expect(r.state).toBe('upcoming');
    expect(r.daysRemaining).toBe(5);
  });
});
