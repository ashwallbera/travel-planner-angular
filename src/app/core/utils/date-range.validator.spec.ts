import { describe, expect, it } from 'vitest';
import { validateDateRange } from './date-range.validator';

describe('validateDateRange', () => {
  it('allows empty dates', () => {
    expect(validateDateRange()).toEqual({ valid: true });
  });

  it('rejects end before start', () => {
    expect(validateDateRange('2026-06-10', '2026-06-01')).toEqual({
      valid: false,
      message: 'End date cannot be before start date.',
    });
  });

  it('allows partial dates', () => {
    expect(validateDateRange('2026-06-01')).toEqual({ valid: true });
  });
});
