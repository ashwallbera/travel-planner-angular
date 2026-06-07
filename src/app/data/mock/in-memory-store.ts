import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type {
  Activity,
  ActivityRating,
  AppNotification,
  BudgetEntry,
  ChangelogEntry,
  DiaryEntry,
  FoodSpot,
  InviteToken,
  PackingItem,
  PocketItem,
  Poll,
  PollNudge,
  PollVote,
  Trip,
  TripMember,
  TripRating,
  User,
} from '../../core/models';

export interface AppData {
  users: User[];
  trips: Trip[];
  members: TripMember[];
  invites: InviteToken[];
  activities: Activity[];
  budgetEntries: BudgetEntry[];
  polls: Poll[];
  pollVotes: PollVote[];
  pollNudges: PollNudge[];
  pocketItems: PocketItem[];
  diaryEntries: DiaryEntry[];
  foodSpots: FoodSpot[];
  changelog: ChangelogEntry[];
  notifications: AppNotification[];
  packingItems: PackingItem[];
  tripRatings: TripRating[];
  activityRatings: ActivityRating[];
}

const STORAGE_KEY = 'travel-planner-mock-v2';

function defaultData(): AppData {
  const users: User[] = [
    { id: 'u1', email: 'alex@example.com', displayName: 'Alex Organizer', avatarUrl: undefined },
    { id: 'u2', email: 'jamie@example.com', displayName: 'Jamie Lee' },
    { id: 'u3', email: 'sam@example.com', displayName: 'Sam Rivera' },
  ];
  return {
    users,
    trips: [],
    members: [],
    invites: [],
    activities: [],
    budgetEntries: [],
    polls: [],
    pollVotes: [],
    pollNudges: [],
    pocketItems: [],
    diaryEntries: [],
    foodSpots: [],
    changelog: [],
    notifications: [],
    packingItems: [],
    tripRatings: [],
    activityRatings: [],
  };
}

function migrateData(parsed: Partial<AppData>): AppData {
  const base = defaultData();
  const merged: AppData = {
    ...base,
    ...parsed,
    users: parsed.users?.length ? parsed.users : base.users,
    pollNudges: parsed.pollNudges ?? [],
    changelog: parsed.changelog ?? [],
    notifications: parsed.notifications ?? [],
    packingItems: parsed.packingItems ?? [],
    tripRatings: parsed.tripRatings ?? [],
    activityRatings: parsed.activityRatings ?? [],
  };
  merged.polls = (merged.polls ?? []).map((p) => ({
    ...p,
    status: p.status === 'closed' ? 'closed' : p.status === 'locked' ? 'locked' : p.status === 'finalizing' ? 'finalizing' : 'open',
    confirmations: p.confirmations ?? [],
    concerns: p.concerns ?? [],
  }));
  merged.budgetEntries = (merged.budgetEntries ?? []).map((e) => ({
    ...e,
    paid: e.paid ?? false,
    auditLog: e.auditLog ?? [],
  }));
  merged.activities = (merged.activities ?? []).map((a) => ({
    ...a,
    auditLog: a.auditLog ?? [],
  }));
  return merged;
}

@Injectable({ providedIn: 'root' })
export class InMemoryStore {
  private readonly subject = new BehaviorSubject<AppData>(this.load());

  readonly data$ = this.subject.asObservable();

  snapshot(): AppData {
    return this.subject.value;
  }

  update(mutator: (data: AppData) => void): void {
    const next = structuredClone(this.subject.value);
    mutator(next);
    this.subject.next(next);
    this.persist(next);
  }

  private load(): AppData {
    if (typeof localStorage === 'undefined') {
      return defaultData();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const legacy = localStorage.getItem('travel-planner-mock-v1');
        if (legacy) return migrateData(JSON.parse(legacy) as Partial<AppData>);
        return defaultData();
      }
      return migrateData(JSON.parse(raw) as Partial<AppData>);
    } catch {
      return defaultData();
    }
  }

  private persist(data: AppData): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota */
    }
  }
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
