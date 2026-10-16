// Only plain calculations in this file: no file access, no Express.
// That keeps the rules easy to read and easy to test.

const RECENT_ACTIVITY_WINDOW_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The one place that decides a task's status. Tasks only have a boolean `completed`,
// so nothing can be "in-progress" yet and that count stays 0. If tasks get a real
// status field later, this is the only function to change.
function getTaskStatus(task) {
  return task.completed ? 'done' : 'todo';
}

function countTasksByStatus(tasks) {
  const byStatus = { todo: 0, 'in-progress': 0, done: 0 };

  for (const task of tasks) {
    byStatus[getTaskStatus(task)] += 1;
  }

  return byStatus;
}

// Counts entries from the last `windowDays` days, up to and including `now`.
// A missing or invalid `when` gives NaN from Date.parse, and every comparison
// with NaN is false, so those entries are skipped without any extra code.
function countRecentActivity(entries, now, windowDays = RECENT_ACTIVITY_WINDOW_DAYS) {
  const windowEnd = now.getTime();
  const windowStart = windowEnd - windowDays * MS_PER_DAY;

  return entries.filter((entry) => {
    const time = Date.parse(entry.when);

    return time >= windowStart && time <= windowEnd;
  }).length;
}

function buildTasksSummary(tasks, activityEntries, now) {
  return {
    total: tasks.length,
    byStatus: countTasksByStatus(tasks),
    recentActivityCount: countRecentActivity(activityEntries, now),
  };
}

module.exports = {
  RECENT_ACTIVITY_WINDOW_DAYS,
  getTaskStatus,
  countTasksByStatus,
  countRecentActivity,
  buildTasksSummary,
};
