import { describe, expect, it } from 'vitest';
import { validateCompanions } from './companion.validator';

describe('validateCompanions', () => {
  it('rejects when breakdown exceeds traveler count', () => {
    const r = validateCompanions({ adults: 2, seniors: 1, children: 1 }, 3);
    expect(r.valid).toBe(false);
  });

  it('requires at least one adult', () => {
    const r = validateCompanions({ adults: 0, seniors: 0, children: 0 }, 2);
    expect(r.valid).toBe(false);
  });

  it('accepts valid breakdown', () => {
    const r = validateCompanions({ adults: 2, seniors: 0, children: 1 }, 4);
    expect(r.valid).toBe(true);
  });
});
