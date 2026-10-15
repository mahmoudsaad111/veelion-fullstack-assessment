const fs = require('node:fs/promises');

// One promise chain per file, so changes to the same file run one at a time.
const writeQueues = new Map();

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]\n', 'utf-8');
      return [];
    }

    throw error;
  }
}

// Writes to a temporary file first and then renames it over the original,
// so a crash in the middle of a write cannot leave half a JSON file behind.
async function writeJsonArray(filePath, data) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  await fs.rename(temporaryPath, filePath);
}

function runExclusive(filePath, task) {
  const previous = writeQueues.get(filePath) || Promise.resolve();
  const current = previous.then(task);

  // The stored promise never rejects, so one failed task cannot block the next.
  writeQueues.set(filePath, current.catch(() => {}));

  return current;
}

// Read, change and write the array as one step. `mutate` receives the array,
// changes it in place and returns the value for the caller. If it throws,
// nothing is written.
function updateJsonArray(filePath, mutate) {
  return runExclusive(filePath, async () => {
    const items = await readJsonArray(filePath);
    const result = await mutate(items);

    await writeJsonArray(filePath, items);

    return result;
  });
}

module.exports = {
  readJsonArray,
  writeJsonArray,
  updateJsonArray,
};
