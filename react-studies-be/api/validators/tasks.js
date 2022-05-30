const { object, string, boolean } = require('yup');
const Validators = require('../../util/validation');
const { Task } = require('../../models');


module.exports = {
  list: {
    query: object(Validators.withPagination({
      teacherId: Validators.entityId().optional(),
      q: string().max(30).optional()
    })).noUnknown(),
    body: Validators.ensureEmpty()
  },
  create: {
    body: object({
      kind: Validators.enumOf(Task.TASK_KINDS).required(),
      title: Validators.standardText(30),
      description: string().optional(),
      attachmentNames: Validators.uniqList(
        string().max(30).matches(
          /^[-.\w _\d]+$/,
          'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
        ).required(), 'Reference name',
      ).test('sameLength', 'Must have an entry for each attachment', (value, { options: { context } }) =>
        !value || !context.body.attachments || context.body.attachments.length === value.length,
      ).when('attachments', {
        is: v => !!v,
        then: schema => schema.required(),
        otherwise: schema => schema.optional(),
      }),
      trackUpdates: boolean().required(),

      gitHubToken: Validators.gitHubToken(),
      rememberToken: boolean().required(),

      mustUse: Validators.onlyKind(Task.TASK_KINDS.layout, Validators.elementList(['tag'])),
      absPos: Validators.onlyKind(Task.TASK_KINDS.layout, Validators.caveat()),
      rawSizing: Validators.onlyKind(Task.TASK_KINDS.layout, Validators.caveat()),
    }).noUnknown(),
    files: {
      attachments: Validators.file(
        'image/*,text/*,video/*,audio/*,font/*,application/pdf,application/msword,application/zip',
        [10, Validators.SIZE_UNITS.MB], true,
      ).optional(),
      sampleImage: Validators.onlyKind(
        Task.TASK_KINDS.layout,
        Validators.file('image/*', [4, Validators.SIZE_UNITS.MB]).required(),
      ),
    },
    query: Validators.ensureEmpty()
  },
};
