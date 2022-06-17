const { object, boolean, mixed, string, array } = require('yup');
const Validators = require('../../util/validation');
const { Task, TemplateConfig } = require('../../models');


function getTemplate(task, kind) {
  if (task.kind !== Task.TASK_KINDS.react) {
    return null;
  }
  return task.reactTask.teacherTemplateConfigs.find(cfg => cfg.kind === kind);
}

function hasDump(task) {
  return task.kind === Task.TASK_KINDS.react && !!task.reactTask.dump;
}

function matchingTeacherCfg(schema, templateKind, templateField) {
  return schema.test(
    'matchingTeacherCfg',
    'Must fill in the empty fields and keep the predefined ones',
    (value, { options: { context: { body: { task } } } }) => {
      const template = getTemplate(task, templateKind);
      const teacherValues = template[templateField];
      return !teacherValues || value.every((entry, idx) => !teacherValues[idx] || value === teacherValues[idx]);
    });
}

function needsStudentCfg(task, templateKind, templateField) {
  const template = getTemplate(task, templateKind);
  return !!template && (
    !template[templateField] ||
    template[templateField].some(entry => !entry) ||
    !template[templateField].filter(Boolean).length
  );
}

module.exports = {
  list: {
    query: object({
      taskId: Validators.entityId().optional(),
    }).withPagination(),
    body: Validators.ensureEmpty()
  },
  create: {
    body: object({
      task: mixed().test(
        'isTask',
        'No such task',
        value => !!value && value instanceof Task,
      ).label('taskId'),
      gitHubToken: Validators.gitHubToken().canSkip(),
      rememberToken: boolean().optional(),

      dumpUploadUrl: string().when('task', {
        is: task => hasDump(task) && !task.reactTask.dumpUploadUrl,
        then: schema => schema.absoluteUrl().required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      dumpUploadMethod: string().when('task', {
        is: task => hasDump(task) && !task.reactTask.dumpUploadMethod,
        then: schema => schema.oneOf(['post', 'patch', 'put']).required(),
        otherwise: () => Validators.ensureEmpty()
      }),

      authRoutes: array().when('task', {
        is: task => needsStudentCfg(task, TemplateConfig.TEMPLATE_KINDS.authTemplate, 'routes'),
        then: schema => matchingTeacherCfg(
          schema.of(string().navRoute().required()).length(2).required(),
          TemplateConfig.TEMPLATE_KINDS.authTemplate,
          'routes'
        ),
        otherwise: () => Validators.ensureEmpty()
      }),
      authEndpoints: array().when('task', {
        is: task => needsStudentCfg(task, TemplateConfig.TEMPLATE_KINDS.authTemplate, 'endpoints'),
        then: schema => matchingTeacherCfg(
          schema.of(string().relativeUrl().required()).required().when('task', {
            is: task => !!task.reactTask?.hasVerification,
            then: arraySchema => arraySchema.length(3),
            otherwise: arraySchema => arraySchema.length(2)
          }),
          TemplateConfig.TEMPLATE_KINDS.authTemplate,
          'endpoints'
        ),
        otherwise: () => Validators.ensureEmpty()
      }),
      authSpecial: string().when('task', {
        is: task => {
          const authTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.authTemplate);
          return !!authTemplate && !authTemplate.special;
        },
        then: schema => schema.navRoute().required(),
        otherwise: () => Validators.ensureEmpty()
      }),

      entityListRoutes: array().when('task', {
        is: task => needsStudentCfg(task, TemplateConfig.TEMPLATE_KINDS.entityListTemplate, 'routes'),
        then: schema => schema.of(string().navRoute().required()).length(1).required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      entityListEndpoints: array().when('task', {
        is: task => needsStudentCfg(task, TemplateConfig.TEMPLATE_KINDS.entityListTemplate, 'endpoints'),
        then: schema => schema.of(string().relativeUrl().required()).min(1).required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      entityListSpecial: string().when('task', {
        is: task => {
          const listTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.entityListTemplate);
          return !!listTemplate && task.reactTask.hasSearch && !listTemplate.special;
        },
        then: schema => schema.relativeUrl().required(),
        otherwise: () => Validators.ensureEmpty()
      }),

      singleEntityRoutes: array().when('task', {
        is: task => needsStudentCfg(task, TemplateConfig.TEMPLATE_KINDS.singleEntityTemplate, 'routes'),
        then: schema => schema.of(
          string().required().when('task', {
            is: task => !!task.dump,
            then: entrySchema => entrySchema.keyPattern(),
            otherwise: entrySchema => entrySchema.navRoute()
          })
        ).length(1).required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      singleEntityEndpoints: array().when('task', {
        is: task => needsStudentCfg(task, TemplateConfig.TEMPLATE_KINDS.singleEntityTemplate, 'endpoints'),
        then: schema => schema.of(string().relativeUrl().required()).min(1).required(),
        otherwise: () => Validators.ensureEmpty()
      })
    }).noUnknown(),
    query: Validators.ensureEmpty()
  },
  urgentToken: {
    body: Validators.strictObject({
      gitHubToken: Validators.gitHubToken(),
      rememberToken: boolean()
    }),
    query: Validators.ensureEmpty()
  },
  update: {}
}
