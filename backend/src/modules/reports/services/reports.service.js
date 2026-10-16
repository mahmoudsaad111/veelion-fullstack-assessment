const tasksService = require('../../tasks/services/tasks.service');
const activityService = require('../../activity/services/activity.service');
const { buildTasksSummary } = require('../utils/summaryCalculator');

// Use the Tasks and Activity services so file paths and parsing stay centralized.
async function getTasksSummary() {
  const [tasks, activityEntries] = await Promise.all([
    tasksService.getAllTasks(),
    activityService.getAllActivity(),
  ]);

  return buildTasksSummary(tasks, activityEntries, new Date());
}

module.exports = {
  getTasksSummary,
};
