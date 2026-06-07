import { describe, expect, it } from 'vitest';
import { PollConsensusService } from '../services/poll-consensus.service';
import type { Poll } from '../models';

describe('PollConsensusService', () => {
  const service = new PollConsensusService();

  const poll: Poll = {
    id: 'p1',
    tripId: 't1',
    title: 'Test',
    options: [
      { id: 'o1', label: 'A' },
      { id: 'o2', label: 'B' },
    ],
    status: 'open',
    createdBy: 'u1',
    createdByName: 'A',
    createdAt: '',
  };

  it('detects majority with 3 members', () => {
    const result = service.analyze(poll, { u1: 'o1', u2: 'o1' }, 3);
    expect(result.hasMajority).toBe(true);
    expect(result.leadingOptionId).toBe('o1');
  });

  it('allows finalizing transition when majority', () => {
    const result = service.analyze(poll, { u1: 'o1', u2: 'o1' }, 3);
    expect(service.canTransitionToFinalizing(poll, result)).toBe(true);
  });
});
