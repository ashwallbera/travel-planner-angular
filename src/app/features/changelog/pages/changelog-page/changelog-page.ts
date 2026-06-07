import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { CHANGELOG_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-changelog-page',
  standalone: true,
  imports: [PageHeader, EmptyState, DatePipe],
  templateUrl: './changelog-page.html',
  styleUrl: './changelog-page.scss',
})
export class ChangelogPage {
  readonly ctx = inject(TripContextService);
  private readonly changelog = inject(CHANGELOG_REPOSITORY);

  readonly entries = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.changelog.list(id)),
    ),
    { initialValue: [] },
  );
}
