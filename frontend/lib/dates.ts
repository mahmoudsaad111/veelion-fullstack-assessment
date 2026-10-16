const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// "2 hours ago" is easier to scan than a full timestamp. The full date is
// still there on hover (title attribute), so no information is lost.
export function formatRelativeTime(value: string, now: Date = new Date()): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "at an unknown time";
  }

  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }

  return "just now";
}
