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
  destination: string;
  startDate: string;
  endDate: string;
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
}

export interface InviteToken {
  tripId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
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

export type BudgetSourceType = 'manual' | 'itinerary' | 'pocket';

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
}

export interface PollOption {
  id: string;
  label: string;
  imageUrl?: string;
}

export type PollStatus = 'open' | 'closed';

export interface Poll {
  id: string;
  tripId: string;
  title: string;
  options: PollOption[];
  deadline?: string;
  status: PollStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface PollVote {
  pollId: string;
  userId: string;
  optionId: string;
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

export interface CreateTripDto {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string;
  currency: CurrencyCode;
  travelerCount: number;
  companions: CompanionBreakdown;
  budgetLimit?: number;
}
