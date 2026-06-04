import { inject } from '@angular/core';
import { CanActivateFn, Router, type ActivatedRouteSnapshot } from '@angular/router';
import { map, take } from 'rxjs';
import { MEMBER_REPOSITORY } from '../tokens/repository.tokens';
import { MockAuthService } from '../../data/mock/mock-auth.service';

function tripIdFromSnapshot(route: ActivatedRouteSnapshot): string | null {
  let current: ActivatedRouteSnapshot | null = route;
  while (current) {
    const id = current.paramMap.get('tripId');
    if (id) return id;
    current = current.parent;
  }
  return null;
}

export const tripMemberGuard: CanActivateFn = (route) => {
  const tripId = tripIdFromSnapshot(route);
  const auth = inject(MockAuthService);
  const members = inject(MEMBER_REPOSITORY);
  const router = inject(Router);
  const user = auth.currentUser();
  if (!tripId || !user) return router.createUrlTree(['/trips']);
  return members.isMember(tripId, user.id).pipe(
    take(1),
    map((ok) => (ok ? true : router.createUrlTree(['/trips']))),
  );
};
