const { mixed, object, number, string } = require('yup');
const { mapValues } = require('lodash');


function strictObject(spec) {
  return object(mapValues(spec, f => f.required())).noUnknown();
}

function enumOf(options, message) {
  return mixed().oneOf(Array.isArray(options) ? options : Object.values(options), message);
}

const ensureEmpty = mixed().test({
  name: 'isEmpty',
  message: '${path} must be empty',
  test: value => value == null
});

// === === ===

const gitHubToken = string()
  .matches(/ghp_\w{36}/, { message: 'Should be a personal access token' })
  .test((value, context) => !!(value || context.options.context.user.gitHubToken));

const niceNumber = number().positive().integer();

const entityId = number().integer().min(1);

const withPagination = {
  page: niceNumber.optional(),
  pageSize: niceNumber.optional(),
};

const multerFile = strictObject({
  fieldname: string(),
  originalname: string(),
  encoding: string(),
  mimetype: string(),
  size: number().positive(),
  destination: string(),
  filename: string(),
  path: string()
});

module.exports = {
  strictObject, enumOf,
  ensureEmpty, niceNumber, entityId, withPagination, gitHubToken, multerFile
};
