const httpMethods = require('../_http-methods');
const { mapValues } = require('lodash');
const paths = require('../_paths');
const { object, string, boolean, array, number } = require('yup');
const { gitHubToken, enumOf, ensureEmpty, multerFile } = require('../../util/validation');
const { Task } = require('../../models');


function elementsList(tagRequired) {
  let elementSchema = object({
    tag: string()[tagRequired ? 'optional' : 'required'](),
    content: array().of(string().required()).optional()
  }).noUnknown().required();
  if (!tagRequired) {
    elementSchema = elementSchema.test(
      'atLeastOneConstraint',
      '${path} must hold at least one constraint',
      value => value.tag || value.content
    );
  }
  return array().of(elementSchema).optional();
}

const caveat = object({
  maxUsage: number().positive().optional(),
  allowedFor: elementsList(false)
}).noUnknown().optional();

function onlyKind(kind, schema) {
  return schema.when('kind', {
    is: kind,
    then: schema => schema,
    otherwise: () => ensureEmpty
  })
}

module.exports = [
  {
    method: httpMethods.post,
    path: paths.root,
    validator: object().transform(value => mapValues(value, (fieldValue, fieldName) => {
      if (['absPos', 'rawSizing'].includes(fieldName)) {
        return JSON.parse(fieldValue);
      }
      if (['mustUse'].includes(fieldName)) {
        return fieldValue.map(el => JSON.parse(el));
      }
      return fieldValue;
    })).shape({
      kind: enumOf(Task.TASK_KINDS).required(),
      gitHubToken: gitHubToken,
      title: string().max(30).required(),
      description: string().max(1500).optional(),
      attachments: array().of(multerFile).optional(),
      attachmentNames: array().of(string().required()).test(
        'sameLength',
        '${path} must either be omitted or have same length as attachments',
        (value, context) => {
          if (!value || !context.parent.attachments) {
            return true;
          }
          return value.length === context.parent.attachments.length;
        }
      ),

      mustUse: onlyKind(Task.TASK_KINDS.layout, elementsList(true)),
      absPos: onlyKind(Task.TASK_KINDS.layout, caveat),
      rawSizing: onlyKind(Task.TASK_KINDS.layout, caveat),
      sampleImage: onlyKind(Task.TASK_KINDS.layout, array().of(multerFile).max(1)),

      includeFuzzing: onlyKind(Task.TASK_KINDS.react, boolean().optional())
    }).noUnknown()
  }
];
