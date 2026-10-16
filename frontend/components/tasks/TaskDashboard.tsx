"use client";

import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/api";
import { StatusFilter } from "@/components/tasks/StatusFilter";
import { TaskList } from "@/components/tasks/TaskList";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";

export function TaskDashboard() {
  const {
    tasks,
    filteredTasks,
    counts,
    filter,
    loading,
    loadError,
    updateError,
    updatingTaskId,
    setFilter,
    fetchTasks,
    updateTaskStatus,
  } = useTasks();

  const handleToggle = (task: Task) => {
    updateTaskStatus(task.id, !task.completed);
  };

  return (
    <section className="stack">
      <PageHeader title="Task Dashboard" description="Click the circle next to a task to mark it as done." />

      {/* Show filters after the task list has loaded successfully. */}
      {!loading && !loadError ? <StatusFilter value={filter} counts={counts} onChange={setFilter} /> : null}

      {loading ? <LoadingState label="Loading tasks..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={fetchTasks} /> : null}
      {updateError ? <ErrorState message={updateError} /> : null}

      {!loading && !loadError ? (
        <TaskList
          tasks={filteredTasks}
          hasTasks={tasks.length > 0}
          filter={filter}
          updatingTaskId={updatingTaskId}
          onToggle={handleToggle}
        />
      ) : null}
    </section>
  );
}
