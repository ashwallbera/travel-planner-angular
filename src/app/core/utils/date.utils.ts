export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function eachDayInRange(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  const start = parseDateOnly(startIso);
  const end = parseDateOnly(endIso);
  const cur = new Date(start);
  while (cur <= end) {
    days.push(formatDateOnly(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function isDateInRange(dateIso: string, startIso: string, endIso: string): boolean {
  const d = parseDateOnly(dateIso).getTime();
  return (
    d >= parseDateOnly(startIso).getTime() && d <= parseDateOnly(endIso).getTime()
  );
}

export function compareDateStrings(a: string, b: string): number {
  return parseDateOnly(a).getTime() - parseDateOnly(b).getTime();
}
