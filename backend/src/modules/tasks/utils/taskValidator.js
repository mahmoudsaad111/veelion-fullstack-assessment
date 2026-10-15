const HttpError = require('../../../utils/httpError');
const {
  assertPlainObject,
  assertNoUnknownFields,
  readOptionalString,
} = require('../../../utils/validation');

const ALLOWED_FIELDS = ['title', 'completed'];
const MAX_TITLE_LENGTH = 200;

function normalizeTitleIfPresent(payload, normalized) {
  const title = readOptionalString(payload, 'title', MAX_TITLE_LENGTH);

  if (title === undefined) {
    return;
  }

  if (!title) {
    throw new HttpError(400, '"title" cannot be empty.');
  }

  normalized.title = title;
}

function normalizeCompletedIfPresent(payload, normalized) {
  if (!Object.hasOwn(payload, 'completed')) {
    return;
  }

  if (typeof payload.completed !== 'boolean') {
    throw new HttpError(400, '"completed" must be a boolean.');
  }

  normalized.completed = payload.completed;
}

function validateCreateTask(payload) {
  assertPlainObject(payload);
  assertNoUnknownFields(payload, ALLOWED_FIELDS);

  const normalized = {};
  normalizeTitleIfPresent(payload, normalized);
  normalizeCompletedIfPresent(payload, normalized);

  if (!Object.hasOwn(normalized, 'title')) {
    throw new HttpError(400, '"title" is required.');
  }

  if (!Object.hasOwn(normalized, 'completed')) {
    normalized.completed = false;
  }

  return normalized;
}

function validateUpdateTask(payload) {
  assertPlainObject(payload);
  assertNoUnknownFields(payload, ALLOWED_FIELDS);

  const normalized = {};
  normalizeTitleIfPresent(payload, normalized);
  normalizeCompletedIfPresent(payload, normalized);

  if (Object.keys(normalized).length === 0) {
    throw new HttpError(400, 'Provide at least one updatable field.');
  }

  return normalized;
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
