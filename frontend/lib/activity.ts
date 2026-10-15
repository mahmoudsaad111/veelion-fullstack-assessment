import type { ActivityLog } from "@/types/api";

export function filterActivity(items: ActivityLog[], query: string): ActivityLog[] {
  if (!query) {
    return items;
  }

  const text = query.toLowerCase();

  return items.filter(
    (item) =>
      (item.action || "").toLowerCase().includes(text) ||
      (item.info || "").toLowerCase().includes(text)
  );
}

export function formatActivityTime(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}
