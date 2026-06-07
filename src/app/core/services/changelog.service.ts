import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import type { ChangelogEventType } from '../models';
import { CHANGELOG_REPOSITORY } from '../tokens/repository.tokens';
import type { LogChangelogInput } from '../../data/repositories/changelog.repository';

@Injectable({ providedIn: 'root' })
export class ChangelogService {
  private readonly repo = inject(CHANGELOG_REPOSITORY);

  log(
    tripId: string,
    type: ChangelogEventType,
    summary: string,
    actorId: string,
    actorName: string,
    metadata?: Record<string, unknown>,
  ): void {
    const input: LogChangelogInput = { tripId, type, summary, actorId, actorName, metadata };
    this.repo.append(input).subscribe();
  }
}
