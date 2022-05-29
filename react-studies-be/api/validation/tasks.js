const httpMethods = require('../_http-methods');
const mapValues = require('lodash/mapValues');
const paths = require('../_paths');
const { object, string, boolean } = require('yup');
const Validators = require('../../util/validation');
const { Task } = require('../../models');


module.exports = [
  {
    method: httpMethods.post,
    path: paths.root,
    transformer: value => mapValues(value, (fieldValue, fieldName) => {
      if (['absPos', 'rawSizing'].includes(fieldName)) {
        return JSON.parse(fieldValue);
      }
      if (['mustUse'].includes(fieldName)) {
        const adjusted = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
        return adjusted.map(el => JSON.parse(el));
      }
      if (['rememberToken', 'trackUpdates'].includes(fieldName)) {
        switch (fieldValue) {
          case 'true':
            return true;
          case 'false':
            return false;
          default:
            return fieldValue;
        }
      }
      return fieldValue;
    }),
    validator: object({
      kind: Validators.enumOf(Task.TASK_KINDS).required(),
      title: Validators.standardText(30),
      description: string().optional(),
      attachments: Validators.file(
        'image/*,text/*,video/*,audio/*,font/*,application/pdf,application/msword,application/zip',
        [10, Validators.SIZE_UNITS.MB], true
      ).optional(),
      attachmentNames: Validators.uniqList(
        string().max(30).matches(
          /^[-.\w _\d]+$/,
          'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
        ).required(), 'Reference name'
      ).test('sameLength', 'Must have an entry for each attachment', (value, { parent }) =>
        !value || !parent.attachments || parent.attachments.length === value.length,
      ).when('attachments', {
        is: v => !!v,
        then: schema => schema.required(),
        otherwise: schema => schema.optional()
      }),
      trackUpdates: boolean().required(),

      gitHubToken: Validators.gitHubToken(),
      rememberToken: boolean().required(),

      sampleImage: Validators.onlyKind(
        Task.TASK_KINDS.layout,
        Validators.file('image/*', [4, Validators.SIZE_UNITS.MB]).required()
      ),
      mustUse: Validators.onlyKind(Task.TASK_KINDS.layout, Validators.elementList(['tag'])),
      absPos: Validators.onlyKind(Task.TASK_KINDS.layout, Validators.caveat()),
      rawSizing: Validators.onlyKind(Task.TASK_KINDS.layout, Validators.caveat())
    }).noUnknown()
  }
];
