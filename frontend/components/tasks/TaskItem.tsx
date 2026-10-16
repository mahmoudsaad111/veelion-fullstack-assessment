import { formatRelativeTime } from "@/lib/dates";
import type { Task } from "@/types/api";

type TaskItemProps = {
  task: Task;
  busy: boolean;
  onToggle: (task: Task) => void;
};

export function TaskItem({ task, busy, onToggle }: TaskItemProps) {
  return (
    <li className="task-item" data-completed={task.completed}>
      {/* The circular button states the action that will happen when it is selected. */}
      <button
        type="button"
        className="task-item__toggle"
        onClick={() => onToggle(task)}
        disabled={busy}
        aria-busy={busy}
        aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
      >
        <svg className="task-item__check" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="task-item__body">
        <p className="task-item__title">{task.title}</p>
        <small className="task-item__meta">
          {busy ? (
            "Saving..."
          ) : (
            <>
              Updated{" "}
              <time dateTime={task.updatedAt} title={new Date(task.updatedAt).toLocaleString()}>
                {formatRelativeTime(task.updatedAt)}
              </time>
            </>
          )}
        </small>
      </div>
    </li>
  );
}
