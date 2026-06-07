import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { AuditLogEntry } from '../../../core/models';

@Component({
  selector: 'app-audit-trail-feed',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './audit-trail-feed.html',
  styleUrl: './audit-trail-feed.scss',
})
export class AuditTrailFeed {
  readonly entries = input<AuditLogEntry[]>([]);
  readonly title = input('Activity history');
}
