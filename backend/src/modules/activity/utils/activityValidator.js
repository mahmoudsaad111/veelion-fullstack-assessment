const HttpError = require('../../../utils/httpError');
const {
  assertPlainObject,
  assertNoUnknownFields,
  readOptionalString,
} = require('../../../utils/validation');

const ALLOWED_FIELDS = ['action', 'info'];
const MAX_ACTION_LENGTH = 100;
const MAX_INFO_LENGTH = 500;

function validateCreateActivity(payload) {
  assertPlainObject(payload);
  assertNoUnknownFields(payload, ALLOWED_FIELDS);

  const action = readOptionalString(payload, 'action', MAX_ACTION_LENGTH);
  const info = readOptionalString(payload, 'info', MAX_INFO_LENGTH);

  // An empty string is treated the same as not sending the field.
  const normalized = {};
  if (action) {
    normalized.action = action;
  }
  if (info) {
    normalized.info = info;
  }

  if (Object.keys(normalized).length === 0) {
    throw new HttpError(400, 'Provide at least one of "action" or "info".');
  }

  return normalized;
}

module.exports = {
  validateCreateActivity,
};
