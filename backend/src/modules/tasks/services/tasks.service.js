const path = require('node:path');

const { createId } = require('../../../utils/id');
const { readJsonArray, updateJsonArray } = require('../../../utils/jsonStore');
const HttpError = require('../../../utils/httpError');

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

function buildTaskRecord(payload) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: payload.title,
    completed: payload.completed,
    createdAt: now,
    updatedAt: now,
  };
}

async function getAllTasks() {
  return readJsonArray(TASKS_FILE_PATH);
}

async function getTaskById(taskId) {
  const tasks = await readJsonArray(TASKS_FILE_PATH);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new HttpError(404, 'Task not found.');
  }

  return task;
}

// The controller validates and normalizes the payload before it reaches the service.
async function createTask(payload) {
  return updateJsonArray(TASKS_FILE_PATH, (tasks) => {
    const newTask = buildTaskRecord(payload);
    tasks.push(newTask);

    return newTask;
  });
}

// Only title and completed can change. Building the record from these fields
// keeps id and createdAt unchanged.
async function updateTask(taskId, updates) {
  return updateJsonArray(TASKS_FILE_PATH, (tasks) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
      throw new HttpError(404, 'Task not found.');
    }

    const existingTask = tasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      title: updates.title ?? existingTask.title,
      completed: updates.completed ?? existingTask.completed,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;

    return updatedTask;
  });
}

async function deleteTask(taskId) {
  return updateJsonArray(TASKS_FILE_PATH, (tasks) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
      throw new HttpError(404, 'Task not found.');
    }

    const [removedTask] = tasks.splice(taskIndex, 1);

    return removedTask;
  });
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
