const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses a plain "YYYY-MM-DD" string as UTC midnight. All date-only values
 * in this app (RoomAvailability.date, form inputs) must go through this
 * instead of `new Date(str)` or `.setHours(0,0,0,0)` — the latter uses the
 * server's local timezone, which silently shifts the stored calendar date
 * by a day relative to values parsed here whenever the server isn't UTC.
 */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayDateOnly(): Date {
  return parseDateOnly(formatDateOnly(new Date()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Nights of a stay: every date from checkIn (inclusive) to checkOut (exclusive). */
export function getNightsBetween(checkIn: string, checkOut: string): Date[] {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  const nights: Date[] = [];
  for (let d = start; d < end; d = addDays(d, 1)) {
    nights.push(d);
  }
  return nights;
}
