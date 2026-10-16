import type { TaskStatus, TasksSummary } from "@/types/api";

// Display statuses in this order.
export const STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "done"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

// Has to match RECENT_ACTIVITY_WINDOW_DAYS in the backend calculator.
export const RECENT_ACTIVITY_LABEL = "Last 7 days";

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

// Checks the response really has the documented shape before the page uses it.
export function isTasksSummary(value: unknown): value is TasksSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<TasksSummary>;
  const byStatus = candidate.byStatus as Partial<Record<TaskStatus, unknown>> | undefined;

  return (
    isCount(candidate.total) &&
    isCount(candidate.recentActivityCount) &&
    typeof byStatus === "object" &&
    byStatus !== null &&
    STATUS_ORDER.every((status) => isCount(byStatus[status]))
  );
}

// Rounded percentage. Returns 0 when there are no tasks, to avoid dividing by zero.
export function getPercentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}
