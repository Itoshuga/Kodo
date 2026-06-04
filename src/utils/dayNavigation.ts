function normalizeDayIndex(dayIndex: number): number {
  return Number.isFinite(dayIndex) && dayIndex >= 0 ? Math.floor(dayIndex) : 0;
}

export function parseDayIndexParam(
  value: string | null | undefined,
  fallback = 0
): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function formatDayPath(path: string, dayIndex: number): string {
  return `${path}?day=${normalizeDayIndex(dayIndex)}`;
}

export function formatTripDayPath(tripId: string, dayIndex: number): string {
  return formatDayPath(`/trips/${tripId}`, dayIndex);
}
