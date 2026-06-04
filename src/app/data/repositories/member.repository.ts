import type { Observable } from 'rxjs';
import type { InviteToken, TripMember } from '../../core/models';

export interface MemberRepository {
  listMembers(tripId: string): Observable<TripMember[]>;
  getInvite(tripId: string): Observable<InviteToken>;
  regenerateInvite(tripId: string): Observable<InviteToken>;
  joinByToken(token: string, userId: string, displayName: string): Observable<string>;
  removeMember(tripId: string, userId: string): Observable<void>;
  isMember(tripId: string, userId: string): Observable<boolean>;
}
