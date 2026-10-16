import type { Task, TaskFilter } from "@/types/api";
import { TaskItem } from "@/components/tasks/TaskItem";

type TaskListProps = {
  tasks: Task[];
  hasTasks: boolean;
  filter: TaskFilter;
  updatingTaskId: string;
  onToggle: (task: Task) => void;
};

const EMPTY_FILTER_MESSAGES: Record<TaskFilter, string> = {
  all: "No tasks to show.",
  completed: "No completed tasks yet.",
  pending: "No pending tasks. Everything is done.",
};

export function TaskList({ tasks, hasTasks, filter, updatingTaskId, onToggle }: TaskListProps) {
  if (tasks.length === 0) {
    // Two different empty cases: there are no tasks at all, or the filter hides them.
    const message = hasTasks ? EMPTY_FILTER_MESSAGES[filter] : "No tasks have been created yet.";

    return (
      <section className="panel">
        <p className="empty">{message}</p>
      </section>
    );
  }

  return (
    <section aria-label="Task list">
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} busy={updatingTaskId === task.id} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  );
}
