import { BACKEND_BASE_URL } from "@/lib/constants";
import type {
  ActivityLog,
  ErrorResponse,
  Task,
  TaskResponse,
  TasksResponse,
  TasksSummary,
} from "@/types/api";

// Preserve the backend status code so route handlers can return the correct response.
export class BackendError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

function buildBackendUrl(path: string): string {
  return `${BACKEND_BASE_URL}${path}`;
}

async function parseError(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ErrorResponse;
    return body.error?.message || fallback;
  } catch {
    return fallback;
  }
}

async function requestBackend<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildBackendUrl(path), { ...init, cache: "no-store" });
  } catch {
    // The request did not reach the backend because it is unavailable or misconfigured.
    throw new BackendError(502, "The server is not reachable. Please try again.");
  }

  if (!response.ok) {
    throw new BackendError(response.status, await parseError(response));
  }

  return (await response.json()) as T;
}

export async function getTasksFromBackend(): Promise<Task[]> {
  const body = await requestBackend<TasksResponse>("/tasks");
  return body.data;
}

export async function updateTaskInBackend(taskId: string, completed: boolean): Promise<Task> {
  const body = await requestBackend<TaskResponse>(`/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  });

  return body.data;
}

export async function getActivityFromBackend(): Promise<ActivityLog[]> {
  return requestBackend<ActivityLog[]>("/activity");
}

export async function getTasksSummaryFromBackend(): Promise<TasksSummary> {
  return requestBackend<TasksSummary>("/reports/tasks-summary");
}
