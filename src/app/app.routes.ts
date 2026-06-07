import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { tripMemberGuard } from './core/guards/trip-member.guard';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { MainLayout } from './layout/main-layout/main-layout';
import { TripLayout } from './layout/trip-layout/trip-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'trips', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/pages/signup-page/signup-page').then((m) => m.SignupPage),
      },
    ],
  },
  {
    path: 'invite/:token',
    loadComponent: () =>
      import('./features/members/pages/invite-join-page/invite-join-page').then(
        (m) => m.InviteJoinPage,
      ),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'trips',
        loadComponent: () =>
          import('./features/trips/pages/trip-list-page/trip-list-page').then(
            (m) => m.TripListPage,
          ),
      },
      {
        path: 'trips/new',
        loadComponent: () =>
          import('./features/trips/pages/trip-create-page/trip-create-page').then(
            (m) => m.TripCreatePage,
          ),
      },
      {
        path: 'trips/:tripId',
        component: TripLayout,
        canActivate: [tripMemberGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/trip-dashboard/pages/trip-dashboard-page/trip-dashboard-page').then(
                (m) => m.TripDashboardPage,
              ),
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./features/members/pages/trip-settings-page/trip-settings-page').then(
                (m) => m.TripSettingsPage,
              ),
          },
          {
            path: 'itinerary',
            loadComponent: () =>
              import('./features/itinerary/pages/itinerary-page/itinerary-page').then(
                (m) => m.ItineraryPage,
              ),
          },
          {
            path: 'budget',
            loadComponent: () =>
              import('./features/budget/pages/budget-page/budget-page').then((m) => m.BudgetPage),
          },
          {
            path: 'polls',
            loadComponent: () =>
              import('./features/polls/pages/polls-page/polls-page').then((m) => m.PollsPage),
          },
          {
            path: 'pocket',
            loadComponent: () =>
              import('./features/pocket/pages/pocket-page/pocket-page').then((m) => m.PocketPage),
          },
          {
            path: 'diary',
            loadComponent: () =>
              import('./features/diary/pages/diary-page/diary-page').then((m) => m.DiaryPage),
          },
          {
            path: 'food',
            loadComponent: () =>
              import('./features/food-spots/pages/food-spots-page/food-spots-page').then(
                (m) => m.FoodSpotsPage,
              ),
          },
          {
            path: 'changelog',
            loadComponent: () =>
              import('./features/changelog/pages/changelog-page/changelog-page').then(
                (m) => m.ChangelogPage,
              ),
          },
          {
            path: 'packing',
            loadComponent: () =>
              import('./features/packing-list/pages/packing-list-page/packing-list-page').then(
                (m) => m.PackingListPage,
              ),
          },
          {
            path: 'summary',
            loadComponent: () =>
              import('./features/post-trip/pages/post-trip-summary-page/post-trip-summary-page').then(
                (m) => m.PostTripSummaryPage,
              ),
          },
          {
            path: 'ratings',
            loadComponent: () =>
              import('./features/post-trip/pages/post-trip-ratings-page/post-trip-ratings-page').then(
                (m) => m.PostTripRatingsPage,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'trips' },
];
