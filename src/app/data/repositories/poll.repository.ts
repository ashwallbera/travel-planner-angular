import type { Observable } from 'rxjs';
import type { Poll, PollOption } from '../../core/models';

export interface CreatePollInput {
  tripId: string;
  title: string;
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
  close(pollId: string): Observable<Poll>;
}
