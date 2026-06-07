import { Injectable } from '@angular/core';
import type { AuditLogEntry } from '../models';
import { newId } from '../../data/mock/in-memory-store';

@Injectable({ providedIn: 'root' })
export class AuditTrailService {
  describeChange(field: string, from: unknown, to: unknown): string {
    const f = field.replace(/([A-Z])/g, ' $1').toLowerCase();
    if (from === undefined || from === null || from === '') {
      return `Set ${f} to "${to}"`;
    }
    if (to === undefined || to === null || to === '') {
      return `Cleared ${f}`;
    }
    return `Changed ${f} from "${from}" to "${to}"`;
  }

  buildEntry(
    userId: string,
    userName: string,
    action: string,
    details?: string,
  ): Omit<AuditLogEntry, 'id' | 'timestamp'> {
    return { userId, userName, action, details };
  }

  toEntry(partial: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    return {
      ...partial,
      id: newId(),
      timestamp: new Date().toISOString(),
    };
  }

  diffFields<T extends Record<string, unknown>>(
    before: T,
    after: Partial<T>,
    fields: (keyof T)[],
  ): string[] {
    const lines: string[] = [];
    for (const field of fields) {
      if (after[field] !== undefined && before[field] !== after[field]) {
        lines.push(this.describeChange(String(field), before[field], after[field]));
      }
    }
    return lines;
  }
}
