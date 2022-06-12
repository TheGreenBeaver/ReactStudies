const { object, boolean, mixed, string, array } = require('yup');
const Validators = require('../../util/validation');
const { Task, TemplateConfig } = require('../../models');


function getTemplate(task, kind) {
  if (task.kind !== Task.TASK_KINDS.react) {
    return null;
  }
  return task.reactTask.teacherTemplateConfigs.find(cfg => cfg.kind === kind);
}

module.exports = {
  list: {
    query: object({
      taskId: Validators.entityId().canSkip(),
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
      rememberToken: boolean().canSkip(),

      dumpUploadUrl: string().when('task', {
        is: task => task.kind === Task.TASK_KINDS.react && !task.reactTask.dumpUploadUrl,
        then: schema => schema.absoluteUrl().required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      dumpUploadMethod: string().when('task', {
        is: task => task.kind === Task.TASK_KINDS.react && !task.reactTask.dumpUploadMethod,
        then: schema => schema.oneOf(['post', 'patch', 'put']).required(),
        otherwise: () => Validators.ensureEmpty()
      }),

      authRoutes: array().when('task', {
        is: task => {
          const authTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.authTemplate);
          return !!authTemplate?.routes.some(route => !route);
        },
        then: schema => schema.of(string().navRoute().required()).length(2).required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      authEndpoints: array().when('task', {
        is: task => {
          const authTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.authTemplate);
          return !!authTemplate?.endpoints.some(ep => !ep);
        },
        then: schema => schema.of(string().relativeUrl().required()).required().when('task', {
          is: task => !!task.reactTask?.hasVerification,
          then: arraySchema => arraySchema.length(3),
          otherwise: arraySchema => arraySchema.length(2)
        }),
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
        is: task => {
          const listTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.entityListTemplate);
          return !!listTemplate?.routes.some(route => !route);
        },
        then: schema => schema.of(string().navRoute().required()).length(1).required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      entityListEndpoints: array().when('task', {
        is: task => {
          const listTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.entityListTemplate);
          return !!listTemplate && !listTemplate.endpoints?.filter(Boolean).length;
        },
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
        is: task => {
          const singleTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.singleEntityTemplate);
          return !!singleTemplate?.routes.some(route => !route);
        },
        then: schema => schema.of(string().navRoute().required()).length(1).required(),
        otherwise: () => Validators.ensureEmpty()
      }),
      singleEntityEndpoints: array().when('task', {
        is: task => {
          const singleTemplate = getTemplate(task, TemplateConfig.TEMPLATE_KINDS.singleEntityTemplate);
          return !!singleTemplate && !singleTemplate.endpoints?.filter(Boolean).length;
        },
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
