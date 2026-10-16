const path = require('node:path');

const { createId } = require('../../../utils/id');
const { readJsonArray, updateJsonArray } = require('../../../utils/jsonStore');

const ACTIVITY_FILE_PATH = path.join(process.cwd(), 'data', 'activity.json');

async function getAllActivity() {
  return readJsonArray(ACTIVITY_FILE_PATH);
}

// The controller validates and normalizes the payload before it reaches the service.
async function createActivity(payload) {
  return updateJsonArray(ACTIVITY_FILE_PATH, (entries) => {
    const entry = {
      id: createId(),
      action: payload.action,
      info: payload.info,
      when: new Date().toISOString(),
    };

    entries.push(entry);

    return entry;
  });
}

module.exports = {
  getAllActivity,
  createActivity,
};
