import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type {
  Activity,
  BudgetEntry,
  DiaryEntry,
  FoodSpot,
  InviteToken,
  PocketItem,
  Poll,
  PollVote,
  Trip,
  TripMember,
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
  pocketItems: PocketItem[];
  diaryEntries: DiaryEntry[];
  foodSpots: FoodSpot[];
}

const STORAGE_KEY = 'travel-planner-mock-v1';

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
    pocketItems: [],
    diaryEntries: [],
    foodSpots: [],
  };
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
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw) as AppData;
      if (!parsed.users?.length) parsed.users = defaultData().users;
      return parsed;
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
