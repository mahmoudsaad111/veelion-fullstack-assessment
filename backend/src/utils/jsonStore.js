const fs = require('node:fs/promises');

// Each file gets its own queue, so concurrent requests cannot write to the same file.
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

// Write to a temporary file before replacing the original. If the server stops
// during the write, the original file remains intact.
async function writeJsonArray(filePath, data) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  await fs.writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
  await fs.rename(temporaryPath, filePath);
}

function runExclusive(filePath, task) {
  const previous = writeQueues.get(filePath) || Promise.resolve();
  const current = previous.then(task);

  // Keep the queue alive after a failed request so later writes can continue.
  writeQueues.set(filePath, current.catch(() => {}));

  return current;
}

// Read, change and write as one step so another request cannot modify the file in between.
// `mutate` edits the array in place and returns the value needed by the caller.
// If it throws (a 404, for example), nothing gets written.
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
