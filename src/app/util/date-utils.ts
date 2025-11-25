// Convert date-only (YYYY-MM-DD) to UTC ISO
export function toUtcDateOnly(date: any): string | null {
  if (!date) return null;           // if empty, null, undefined → return null
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;  // if invalid date → return null
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
}

// Always send timestamps in UTC
export function toUtcDateTime(date: Date): string {
  return date.toISOString();
}

// How to use for date-only (attendance, leave):
// payload.date = toUtcDateOnly(form.date);

// For timestamps:
// payload.createdAt = toUtcDateTime(new Date());