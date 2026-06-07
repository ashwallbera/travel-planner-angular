import { Provider } from '@angular/core';
import {
  ACTIVITY_REPOSITORY,
  BUDGET_REPOSITORY,
  CHANGELOG_REPOSITORY,
  DIARY_REPOSITORY,
  FOOD_SPOT_REPOSITORY,
  MEMBER_REPOSITORY,
  NOTIFICATION_REPOSITORY,
  PACKING_REPOSITORY,
  POCKET_REPOSITORY,
  POLL_REPOSITORY,
  RATING_REPOSITORY,
  TRIP_REPOSITORY,
} from '../../core/tokens/repository.tokens';
import { MockActivityRepository } from './repositories/mock-activity.repository';
import { MockBudgetRepository } from './repositories/mock-budget.repository';
import { MockChangelogRepository } from './repositories/mock-changelog.repository';
import { MockDiaryRepository } from './repositories/mock-diary.repository';
import { MockFoodSpotRepository } from './repositories/mock-food-spot.repository';
import { MockMemberRepository } from './repositories/mock-member.repository';
import { MockNotificationRepository } from './repositories/mock-notification.repository';
import { MockPackingRepository } from './repositories/mock-packing.repository';
import { MockPocketRepository } from './repositories/mock-pocket.repository';
import { MockPollRepository } from './repositories/mock-poll.repository';
import { MockRatingRepository } from './repositories/mock-rating.repository';
import { MockTripRepository } from './repositories/mock-trip.repository';

export const mockDataProviders: Provider[] = [
  { provide: TRIP_REPOSITORY, useClass: MockTripRepository },
  { provide: MEMBER_REPOSITORY, useClass: MockMemberRepository },
  { provide: ACTIVITY_REPOSITORY, useClass: MockActivityRepository },
  { provide: BUDGET_REPOSITORY, useClass: MockBudgetRepository },
  { provide: POLL_REPOSITORY, useClass: MockPollRepository },
  { provide: POCKET_REPOSITORY, useClass: MockPocketRepository },
  { provide: DIARY_REPOSITORY, useClass: MockDiaryRepository },
  { provide: FOOD_SPOT_REPOSITORY, useClass: MockFoodSpotRepository },
  { provide: CHANGELOG_REPOSITORY, useClass: MockChangelogRepository },
  { provide: NOTIFICATION_REPOSITORY, useClass: MockNotificationRepository },
  { provide: PACKING_REPOSITORY, useClass: MockPackingRepository },
  { provide: RATING_REPOSITORY, useClass: MockRatingRepository },
];
