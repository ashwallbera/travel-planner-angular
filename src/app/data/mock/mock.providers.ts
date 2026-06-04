import { Provider } from '@angular/core';
import {
  ACTIVITY_REPOSITORY,
  BUDGET_REPOSITORY,
  DIARY_REPOSITORY,
  FOOD_SPOT_REPOSITORY,
  MEMBER_REPOSITORY,
  POCKET_REPOSITORY,
  POLL_REPOSITORY,
  TRIP_REPOSITORY,
} from '../../core/tokens/repository.tokens';
import { MockActivityRepository } from './repositories/mock-activity.repository';
import { MockBudgetRepository } from './repositories/mock-budget.repository';
import { MockDiaryRepository } from './repositories/mock-diary.repository';
import { MockFoodSpotRepository } from './repositories/mock-food-spot.repository';
import { MockMemberRepository } from './repositories/mock-member.repository';
import { MockPocketRepository } from './repositories/mock-pocket.repository';
import { MockPollRepository } from './repositories/mock-poll.repository';
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
];
