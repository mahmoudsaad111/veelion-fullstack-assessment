const HttpError = require('./httpError');

function assertPlainObject(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }
}

function assertNoUnknownFields(payload, allowedFields) {
  const unknownFields = Object.keys(payload).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    throw new HttpError(400, 'Body contains unsupported fields.', {
      unsupportedFields: unknownFields,
    });
  }
}

// Returns the trimmed string, or undefined when the field was not sent.
function readOptionalString(payload, fieldName, maxLength) {
  if (!Object.hasOwn(payload, fieldName)) {
    return undefined;
  }

  const value = payload[fieldName];

  if (typeof value !== 'string') {
    throw new HttpError(400, `"${fieldName}" must be a string.`);
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    throw new HttpError(
      400,
      `"${fieldName}" cannot be longer than ${maxLength} characters.`
    );
  }

  return trimmed;
}

module.exports = {
  assertPlainObject,
  assertNoUnknownFields,
  readOptionalString,
};
