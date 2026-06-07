import { InjectionToken } from '@angular/core';
import type { TripRepository } from '../../data/repositories/trip.repository';
import type { MemberRepository } from '../../data/repositories/member.repository';
import type { ActivityRepository } from '../../data/repositories/activity.repository';
import type { BudgetRepository } from '../../data/repositories/budget.repository';
import type { PollRepository } from '../../data/repositories/poll.repository';
import type { PocketRepository } from '../../data/repositories/pocket.repository';
import type { DiaryRepository } from '../../data/repositories/diary.repository';
import type { FoodSpotRepository } from '../../data/repositories/food-spot.repository';
import type { ChangelogRepository } from '../../data/repositories/changelog.repository';
import type { NotificationRepository } from '../../data/repositories/notification.repository';
import type { PackingRepository } from '../../data/repositories/packing.repository';
import type { RatingRepository } from '../../data/repositories/rating.repository';

export const TRIP_REPOSITORY = new InjectionToken<TripRepository>('TRIP_REPOSITORY');
export const MEMBER_REPOSITORY = new InjectionToken<MemberRepository>('MEMBER_REPOSITORY');
export const ACTIVITY_REPOSITORY = new InjectionToken<ActivityRepository>('ACTIVITY_REPOSITORY');
export const BUDGET_REPOSITORY = new InjectionToken<BudgetRepository>('BUDGET_REPOSITORY');
export const POLL_REPOSITORY = new InjectionToken<PollRepository>('POLL_REPOSITORY');
export const POCKET_REPOSITORY = new InjectionToken<PocketRepository>('POCKET_REPOSITORY');
export const DIARY_REPOSITORY = new InjectionToken<DiaryRepository>('DIARY_REPOSITORY');
export const FOOD_SPOT_REPOSITORY = new InjectionToken<FoodSpotRepository>('FOOD_SPOT_REPOSITORY');
export const CHANGELOG_REPOSITORY = new InjectionToken<ChangelogRepository>('CHANGELOG_REPOSITORY');
export const NOTIFICATION_REPOSITORY = new InjectionToken<NotificationRepository>(
  'NOTIFICATION_REPOSITORY',
);
export const PACKING_REPOSITORY = new InjectionToken<PackingRepository>('PACKING_REPOSITORY');
export const RATING_REPOSITORY = new InjectionToken<RatingRepository>('RATING_REPOSITORY');
