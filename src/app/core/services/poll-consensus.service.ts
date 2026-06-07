import { Injectable } from '@angular/core';
import type { Poll } from '../models';

export interface ConsensusResult {
  hasMajority: boolean;
  leadingOptionId?: string;
  leadingVotes: number;
  totalVotes: number;
  allVoted: boolean;
}

@Injectable({ providedIn: 'root' })
export class PollConsensusService {
  analyze(poll: Poll, votes: Record<string, string>, memberCount: number): ConsensusResult {
    const voteValues = Object.values(votes);
    const totalVotes = voteValues.length;
    if (totalVotes === 0) {
      return { hasMajority: false, leadingVotes: 0, totalVotes: 0, allVoted: false };
    }

    const counts = new Map<string, number>();
    for (const optionId of voteValues) {
      counts.set(optionId, (counts.get(optionId) ?? 0) + 1);
    }

    let leadingOptionId: string | undefined;
    let leadingVotes = 0;
    for (const [optionId, count] of counts) {
      if (count > leadingVotes) {
        leadingVotes = count;
        leadingOptionId = optionId;
      }
    }

    const majorityThreshold = Math.floor(memberCount / 2) + 1;
    const hasMajority = leadingVotes >= majorityThreshold;
    const allVoted = totalVotes >= memberCount;

    return { hasMajority, leadingOptionId, leadingVotes, totalVotes, allVoted };
  }

  allConfirmed(poll: Poll, memberIds: string[]): boolean {
    const confirmations = new Set(poll.confirmations ?? []);
    return memberIds.every((id) => confirmations.has(id));
  }

  canTransitionToFinalizing(poll: Poll, consensus: ConsensusResult): boolean {
    return poll.status === 'open' && consensus.hasMajority && !!consensus.leadingOptionId;
  }

  canLock(poll: Poll, memberIds: string[]): boolean {
    return poll.status === 'finalizing' && this.allConfirmed(poll, memberIds);
  }
}
