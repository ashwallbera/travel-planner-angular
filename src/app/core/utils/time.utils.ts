export const GRID_START_HOUR = 6;
export const GRID_END_HOUR = 24;
export const DEFAULT_ACTIVITY_MINUTES = 60;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getActivityEndMinutes(startTime: string, endTime?: string): number {
  if (endTime) {
    return timeToMinutes(endTime);
  }
  return timeToMinutes(startTime) + DEFAULT_ACTIVITY_MINUTES;
}

export function getActivityDurationMinutes(startTime: string, endTime?: string): number {
  return getActivityEndMinutes(startTime, endTime) - timeToMinutes(startTime);
}

export interface TimeRange {
  start: number;
  end: number;
  id: string;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function assignOverlapColumns(ranges: TimeRange[]): Map<string, number> {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const columns = new Map<string, number>();
  const active: { range: TimeRange; col: number }[] = [];

  for (const range of sorted) {
    const stillActive = active.filter((x) => x.range.end > range.start);
    active.length = 0;
    active.push(...stillActive);
    const used = new Set(active.map((x) => x.col));
    let col = 0;
    while (used.has(col)) col++;
    columns.set(range.id, col);
    active.push({ range, col });
  }
  return columns;
}

export function maxOverlapColumns(ranges: TimeRange[]): number {
  const cols = assignOverlapColumns(ranges);
  return Math.max(1, ...cols.values(), 0);
}
