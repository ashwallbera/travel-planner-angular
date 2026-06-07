export type CurrencyCode = 'PHP' | 'USD' | 'EUR';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface CompanionBreakdown {
  adults: number;
  seniors: number;
  children: number;
}

export interface Trip {
  id: string;
  name: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  coverPhotoUrl?: string;
  currency: CurrencyCode;
  travelerCount: number;
  companions: CompanionBreakdown;
  budgetLimit?: number;
  organizerId: string;
  createdAt: string;
}

export interface TripMember {
  tripId: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  joinedAt: string;
  isOrganizer: boolean;
  onboardingSeen?: boolean;
}

export interface InviteToken {
  tripId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  notes?: string;
  estimatedCost?: number;
  pocketItemId?: string;
  isPadlocked?: boolean;
  auditLog?: AuditLogEntry[];
  addedBy: string;
  addedByName: string;
  createdAt: string;
}

export type BudgetCategory =
  | 'flights'
  | 'accommodation'
  | 'food_drinks'
  | 'activities'
  | 'transport'
  | 'others';

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  flights: 'Flights',
  accommodation: 'Accommodation',
  food_drinks: 'Food & Drinks',
  activities: 'Activities & Entrance Fees',
  transport: 'Transport (local)',
  others: 'Others',
};

export type BudgetSourceType = 'manual' | 'itinerary' | 'pocket' | 'poll';

export interface BudgetEntry {
  id: string;
  tripId: string;
  category: BudgetCategory;
  label: string;
  amount: number;
  date: string;
  addedBy: string;
  addedByName: string;
  source?: { type: BudgetSourceType; refId?: string };
  coveredBy?: string[];
  payerId?: string;
  paid?: boolean;
  receiptUrl?: string;
  auditLog?: AuditLogEntry[];
}

export type PollCategory =
  | 'hotel'
  | 'restaurant'
  | 'activity'
  | 'transport'
  | 'general'
  | 'other';

export const POLL_CATEGORY_LABELS: Record<PollCategory, string> = {
  hotel: 'Hotel / Accommodation',
  restaurant: 'Restaurant / Food',
  activity: 'Activity',
  transport: 'Transport',
  general: 'General',
  other: 'Other',
};

export interface PollOption {
  id: string;
  label: string;
  imageUrl?: string;
  price?: number;
  link?: string;
  tags?: string[];
  notes?: string;
}

export type PollStatus = 'open' | 'finalizing' | 'locked' | 'closed';

export type PollLockMethod = 'consensus' | 'executive' | 'deadline';

export interface PollConcern {
  userId: string;
  userName: string;
  message?: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  tripId: string;
  title: string;
  category?: PollCategory;
  options: PollOption[];
  deadline?: string;
  status: PollStatus;
  lockedOptionId?: string;
  lockMethod?: PollLockMethod;
  confirmations?: string[];
  concerns?: PollConcern[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface PollVote {
  pollId: string;
  userId: string;
  optionId: string;
}

export interface PollNudge {
  pollId: string;
  senderId: string;
  targetId: string;
  sentAt: string;
}

export type PocketItemType =
  | 'flight'
  | 'accommodation'
  | 'entrance'
  | 'transport'
  | 'others';

export const POCKET_TYPE_LABELS: Record<PocketItemType, string> = {
  flight: 'Flight',
  accommodation: 'Accommodation',
  entrance: 'Entrance / Activity',
  transport: 'Transport',
  others: 'Others',
};

export interface PocketItem {
  id: string;
  tripId: string;
  type: PocketItemType;
  label: string;
  useDate: string;
  reference?: string;
  amount?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  paid?: boolean;
  addedBy: string;
  addedByName: string;
  createdAt: string;
}

export type DiaryEntryType = 'photo' | 'note';

export interface DiaryEntry {
  id: string;
  tripId: string;
  type: DiaryEntryType;
  content: string;
  caption?: string;
  dateTag: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'any';

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  any: 'Any',
};

export interface FoodSpot {
  id: string;
  tripId: string;
  name: string;
  area?: string;
  notes?: string;
  mealType: MealType;
  triedBy: string[];
  addedBy: string;
  addedByName: string;
  createdAt: string;
}

export type ChangelogEventType =
  | 'trip_created'
  | 'trip_updated'
  | 'member_joined'
  | 'member_removed'
  | 'poll_created'
  | 'poll_locked'
  | 'activity_created'
  | 'activity_updated'
  | 'activity_deleted'
  | 'activity_moved'
  | 'budget_entry_created'
  | 'budget_entry_updated'
  | 'budget_entry_deleted'
  | 'budget_entry_paid'
  | 'pocket_item_created'
  | 'packing_item_created'
  | 'packing_item_claimed'
  | 'packing_item_unclaimed';

export interface ChangelogEntry {
  id: string;
  tripId: string;
  type: ChangelogEventType;
  summary: string;
  actorId: string;
  actorName: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  tripId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  claimedBy?: string;
  claimedByName?: string;
  addedBy: string;
  addedByName: string;
  createdAt: string;
}

export interface TripRating {
  tripId: string;
  userId: string;
  rating: number;
  comment?: string;
  updatedAt: string;
}

export interface ActivityRating {
  activityId: string;
  tripId: string;
  userId: string;
  rating: number;
  comment?: string;
  updatedAt: string;
}

export interface CreateTripDto {
  name: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  coverPhotoUrl?: string;
  currency: CurrencyCode;
  travelerCount: number;
  companions: CompanionBreakdown;
  budgetLimit?: number;
}

export function hasTripDates(trip: Pick<Trip, 'startDate' | 'endDate'>): boolean {
  return !!(trip.startDate?.trim() && trip.endDate?.trim());
}

export function hasTripDestination(trip: Pick<Trip, 'destination'>): boolean {
  return !!(trip.destination?.trim());
}

export function formatTripDestination(trip: Pick<Trip, 'destination'>): string {
  return hasTripDestination(trip) ? trip.destination! : 'TBD';
}

export function formatTripDateRange(trip: Pick<Trip, 'startDate' | 'endDate'>): string {
  if (!hasTripDates(trip)) return 'Dates TBD';
  return `${trip.startDate} – ${trip.endDate}`;
}

export function isTripPast(trip: Pick<Trip, 'endDate'>, now = new Date()): boolean {
  if (!trip.endDate) return false;
  const end = new Date(trip.endDate);
  end.setHours(23, 59, 59, 999);
  return now > end;
}
