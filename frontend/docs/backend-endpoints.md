# Backend API Endpoints

Base URL: `http://localhost:3000`

## Shared Error Shape

```ts
type ErrorResponse = {
  error: {
    message: string;
    details?: unknown; // e.g. { unsupportedFields: string[] }
  };
};
```

Request bodies larger than 10 KB are rejected with `413`.

## Task Endpoints

### GET /tasks

Fetch all tasks.

```ts
type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

type GetTasksResponse = {
  data: Task[];
};
```

### GET /tasks/:id

Fetch one task by ID.

```ts
type GetTaskResponse = {
  data: Task;
};
```

Possible errors:
- `404` when task does not exist.

### POST /tasks

Create a task.

```ts
type CreateTaskRequest = {
  title: string; // required, trimmed, 1 to 200 characters
  completed?: boolean; // default false
};

type CreateTaskResponse = {
  data: Task;
};
```

Possible errors:
- `400` when body is not an object.
- `400` when title is missing, not a string, empty after trimming, or longer than 200 characters.
- `400` when completed is not a boolean.
- `400` when the body contains fields other than `title` and `completed`.

### PATCH /tasks/:id

Update task title or status. Only `title` and `completed` can be changed.

```ts
type PatchTaskRequest = {
  title?: string; // if provided: trimmed, 1 to 200 characters (same rule as POST)
  completed?: boolean;
};

type PatchTaskResponse = {
  data: Task;
};
```

Possible errors:
- `400` when body is invalid (same rules as POST).
- `400` when no supported fields are provided.
- `400` when the body contains fields other than `title` and `completed`.
- `404` when task does not exist.

### DELETE /tasks/:id

Delete task by ID.

```ts
type DeleteTaskResponse = void; // status 204
```

Possible errors:
- `404` when task does not exist.

## Activity Endpoints

### GET /activity

Fetch activity logs.

```ts
type ActivityLog = {
  id: string;
  action?: string;
  info?: string;
  when: string; // ISO datetime
};

type GetActivityResponse = ActivityLog[];
```

### POST /activity

Create activity log entry.

```ts
type CreateActivityRequest = {
  action?: string; // trimmed, up to 100 characters
  info?: string; // trimmed, up to 500 characters
};

type CreateActivityResponse = ActivityLog;
```

At least one of `action` or `info` must be a non-empty string.

Possible errors:
- `400` when body is not an object.
- `400` when `action` or `info` is not a string or is too long.
- `400` when neither `action` nor `info` is provided.
- `400` when the body contains fields other than `action` and `info`.

Notes:
- Response shape for activity endpoints is raw objects/arrays (not wrapped in `data`).

## Reports Endpoints

### GET /reports/tasks-summary

Fetch summary statistics for tasks and activity.

```ts
type TasksSummary = {
  total: number;
  byStatus: {
    todo: number;
    "in-progress": number;
    done: number;
  };
  recentActivityCount: number;
};

type GetTasksSummaryResponse = TasksSummary;
```

Notes:
- `total` is the number of tasks. `todo` and `done` come from the boolean `completed`, so `todo + in-progress + done` always equals `total`.
- `in-progress` is currently returned as `0` because task data only includes boolean `completed`.
- `recentActivityCount` counts activity entries from the last 7 days, up to now. Entries with a missing or invalid `when` are ignored.
- Response shape is raw object.
