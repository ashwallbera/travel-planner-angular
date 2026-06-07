import type { Observable } from 'rxjs';
import type { Poll, PollCategory, PollOption } from '../../core/models';

export interface CreatePollInput {
  tripId: string;
  title: string;
  category?: PollCategory;
  options: Omit<PollOption, 'id'>[];
  deadline?: string;
  createdBy: string;
  createdByName: string;
}

export interface PollRepository {
  list(tripId: string): Observable<Poll[]>;
  getById(id: string): Observable<Poll | undefined>;
  create(input: CreatePollInput): Observable<Poll>;
  vote(pollId: string, userId: string, optionId: string): Observable<void>;
  getVotes(pollId: string): Observable<Record<string, string>>;
  confirm(pollId: string, userId: string): Observable<Poll>;
  flagConcern(pollId: string, userId: string, userName: string, message?: string): Observable<Poll>;
  executiveLock(pollId: string, optionId: string): Observable<Poll>;
  lock(pollId: string, optionId: string, method: 'consensus' | 'executive'): Observable<Poll>;
  close(pollId: string): Observable<Poll>;
  canNudge(pollId: string, senderId: string, targetId: string): Observable<boolean>;
  recordNudge(pollId: string, senderId: string, targetId: string): Observable<void>;
}
