const { object, string, boolean, array, number } = require('yup');
const Validators = require('../../util/validation');
const { Task, ReactTaskPage } = require('../../models');


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
      kind: Validators.enumOf(Task.TASK_KINDS).required(),
      title: Validators.standardText(30),
      description: string().optional(),
      attachmentNames: string().max(30).matches(
        /^[-.\w _\d]+$/,
        'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
      )
        .required()
        .uniqList('Reference name')
        .test('sameLength', 'Must have an entry for each attachment', (value, { options: { context } }) =>
          !value || !context.body.attachments || context.body.attachments.length === value.length,
        ).when('attachments', {
          is: v => !!v,
          then: schema => schema.required(),
          otherwise: schema => schema.optional(),
        }),
      trackUpdates: boolean().required(),

      gitHubToken: Validators.gitHubToken(),
      rememberToken: boolean().required(),

      mustUse: Validators.elementList(['tag']).onlyKind(Task.TASK_KINDS.layout),
      absPos: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),
      rawSizing: Validators.caveat().onlyKind(Task.TASK_KINDS.layout),

      includeFuzzing: boolean().required().onlyKind(Task.TASK_KINDS.react),
      pages: array().of(object({
        template: Validators.enumOf(ReactTaskPage.PAGE_TEMPLATES).required(),
        textDump: string().nullable().optional(),
        fileDumpIndex: number().when('textDump', {
          is: textDump => !!textDump,
          then: () => Validators.ensureEmpty(),
          otherwise: schema => schema.nullable().optional()
        }),
        dumpIsTemplate: boolean().nullable().optional(),
        endpoints: array().of(string().max(2000).required()).min(1).nullable().optional(),
        route: string().max(2000).nullable().optional()
      })).onlyKind(Task.TASK_KINDS.react)
    }).noUnknown(),
    files: {
      attachments: Validators.file(
        'image/*,text/*,video/*,audio/*,font/*,application/pdf,application/msword,application/zip',
        [10, Validators.SIZE_UNITS.MB], true,
      ).optional(),

      sampleImage: Validators.file('image/*', [4, Validators.SIZE_UNITS.MB]).required()
        .onlyKind(Task.TASK_KINDS.layout),

      fileDumps: Validators.file('application/json', [1, Validators.SIZE_UNITS.MB], true)
        .optional().onlyKind(Task.TASK_KINDS.react),
    },
    query: Validators.ensureEmpty()
  },
};
