// Convert date-only (YYYY-MM-DD) to UTC ISO
export function toUtcDateOnly(date: string): string {
  const d = new Date(date);
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