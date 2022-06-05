const { object, string, boolean } = require('yup');
const Validators = require('../../util/validation');
const { Task } = require('../../models');


module.exports = {
  list: {
    query: object({
      teacherId: Validators.entityId().optional(),
      q: string().optional(),
      kind: Validators.enumOf(Task.TASK_KINDS).optional(),
    }).withPagination(),
    body: Validators.ensureEmpty()
  },
  create: {
    body: object({
      // General
      kind: Validators.enumOf(Task.TASK_KINDS).required(),
      title: Validators.standardText(39),
      description: string().optional(),
      attachmentNames: string().max(30).matches(
        /^[-.\w _\d]+$/,
        'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
      )
        .required()
        .uniqList('Reference name')
        .test('sameLength', 'Must have an entry for each attachment', (value, { options: { context } }) =>
          !value || !context.files.attachments || context.files.attachments.length === value.length,
        ).when('attachments', {
          is: v => !!v,
          then: schema => schema.required(),
          otherwise: schema => schema.optional(),
        }),
      trackUpdates: boolean().required(),

      gitHubToken: Validators.gitHubToken(),
      rememberToken: boolean().optional(),

      // Layout
      mustUse: Validators.elementList(['tag']).onlyKind(Task.TASK_KINDS.layout),
      absPos: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),
      rawSizing: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),

      // React
      hasFuzzing: boolean().required().onlyKind(Task.TASK_KINDS.react),

      dump: string().dump().canSkip().onlyKind(Task.TASK_KINDS.react),
      dumpIsTemplate: boolean().canSkip().onlyKind(Task.TASK_KINDS.react),
      dumpUploadMethod: Validators.enumOf(['post', 'put', 'patch']).canSkip().onlyKind(Task.TASK_KINDS.react),
      dumpUploadUrl: string().url().canSkip().onlyKind(Task.TASK_KINDS.react),

      authTemplate: object({
        hasVerification: boolean().required()
      }).templateConfig(),
      entityListTemplate: object({
        hasSearch: boolean().required()
      }).templateConfig(),
      singleEntityTemplate: object().templateConfig()
    }).noUnknown(),
    files: object({
      attachments: Validators.file(
        'image/*,text/*,video/*,audio/*,font/*,application/pdf,application/msword,application/zip',
        [10, Validators.SIZE_UNITS.MB], true,
      ).optional(),

      sampleImage: Validators.file('image/*', [4, Validators.SIZE_UNITS.MB]).required()
        .onlyKind(Task.TASK_KINDS.layout),
    }).noUnknown(),
    query: Validators.ensureEmpty()
  },
};
