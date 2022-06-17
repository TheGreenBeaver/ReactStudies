const { object, string, boolean, array, mixed } = require('yup');
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
  retrieve: {
    body: Validators.ensureEmpty(),
    query: object({
      mini: boolean().optional()
    }).noUnknown()
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
        ),
      trackUpdates: boolean().required(),

      gitHubToken: Validators.gitHubToken().optional(),
      rememberToken: boolean().optional(),

      // Layout
      mustUse: Validators.elementList(['tag']).optional().onlyKind(Task.TASK_KINDS.layout),
      absPos: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),
      rawSizing: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),

      // React
      hasFuzzing: boolean().required().onlyKind(Task.TASK_KINDS.react),

      dump: string().dump().optional().onlyKind(Task.TASK_KINDS.react),
      dumpIsTemplate: boolean().optional().onlyKind(Task.TASK_KINDS.react),
      dumpUploadMethod: Validators.enumOf(['post', 'put', 'patch', '']).optional().onlyKind(Task.TASK_KINDS.react),
      dumpUploadUrl: string().absoluteUrl().optional().onlyKind(Task.TASK_KINDS.react),

      authTemplate: object({
        hasVerification: boolean().required()
      }).templateConfig(
        endpointsSchema => endpointsSchema.when('$body', {
          is: body => body.authTemplate.hasVerification,
          then: s => s.length(3),
          otherwise: s => s.length(2)
        }), 2, true
      ),
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
  update: {
    body: object({
      task: mixed().test(
        'isTask',
        'No such task',
        value => !!value && value instanceof Task,
      ).label('taskId'),
      kind: string().canSkip(),

      title: string().max(39).optional(),
      description: string().optional(),
      attachmentsToDelete: array().of(Validators.entityId()).optional(),
      // TODO: Remaining fields (probably some common func for create / update)
      newAttachmentNames: string().max(30).matches(
        /^[-.\w _\d]+$/,
        'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
      )
        .required()
        .uniqList('Reference name')
        .test('sameLength', 'Must have an entry for each attachment', (value, { options: { context } }) =>
          !value || !context.files.newAttachments || context.files.newAttachments.length === value.length,
        ),
      oldAttachmentNames: Validators.strictObject({
        refName: string().max(30).matches(
          /^[-.\w _\d]+$/,
          'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
        ),
        id: Validators.entityId()
      }).uniqList('Reference name'),
      trackUpdates: boolean().required(),

      gitHubToken: Validators.gitHubToken().canSkip(),
      rememberToken: boolean().optional(),

      // Layout
      mustUse: Validators.elementList(['tag']).onlyKind(Task.TASK_KINDS.layout),
      absPos: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),
      rawSizing: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),

      // React
      hasFuzzing: boolean().required().onlyKind(Task.TASK_KINDS.react),

      dump: string().dump().canSkip().onlyKind(Task.TASK_KINDS.react),
      dumpIsTemplate: boolean().canSkip().onlyKind(Task.TASK_KINDS.react),
      dumpUploadMethod: Validators.enumOf(['post', 'put', 'patch', '']).canSkip().onlyKind(Task.TASK_KINDS.react),
      dumpUploadUrl: string().absoluteUrl().canSkip().onlyKind(Task.TASK_KINDS.react),

      authTemplate: object({
        hasVerification: boolean().required()
      }).templateConfig(),
      entityListTemplate: object({
        hasSearch: boolean().required()
      }).templateConfig(),
      singleEntityTemplate: object().templateConfig()
    }).noUnknown(),
    files: object({
      attachmentsToCreate: Validators.file(
        'image/*,text/*,video/*,audio/*,font/*,application/pdf,application/msword,application/zip',
        [10, Validators.SIZE_UNITS.MB], true,
      ).optional(),

      sampleImage: Validators.file('image/*', [4, Validators.SIZE_UNITS.MB]).canSkip().onlyKind(Task.TASK_KINDS.layout),
    }).noUnknown(),
    query: Validators.ensureEmpty()
  }
};
