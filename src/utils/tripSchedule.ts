interface DateRangeLike {
  startDate?: string;
  endDate?: string;
  date?: string;
}

export interface TripDayOption {
  index: number;
  date?: string;
  label: string;
  shortLabel: string;
}

function asDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

export function getTripDateBounds(trip: DateRangeLike): { startDate?: string; endDate?: string } {
  const startDate = trip.startDate || trip.date;
  const endDate = trip.endDate || trip.startDate || trip.date;
  return { startDate, endDate };
}

export function getTripDayOptions(
  trip: DateRangeLike,
  locale = 'fr-FR'
): TripDayOption[] {
  const { startDate, endDate } = getTripDateBounds(trip);
  const start = asDate(startDate);
  const end = asDate(endDate);

  if (!start || !end || end < start) {
    return [{ index: 0, label: 'Jour 1', shortLabel: 'Jour 1' }];
  }

  const diffDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  return Array.from({ length: diffDays }, (_, index) => {
    const d = addDays(start, index);
    const dIso = toIsoDate(d);
    const pretty = d.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    return {
      index,
      date: dIso,
      shortLabel: `Jour ${index + 1}`,
      label: `Jour ${index + 1} — ${pretty}`,
    };
  });
}

export function formatTripDateRange(trip: DateRangeLike, locale = 'fr-FR'): string | null {
  const { startDate, endDate } = getTripDateBounds(trip);
  const start = asDate(startDate);
  const end = asDate(endDate);

  if (start && end && end >= start) {
    const s = start.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const e = end.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    return s === e ? s : `${s} - ${e}`;
  }

  if (start) {
    return start.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }

  return null;
}
