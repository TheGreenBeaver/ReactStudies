const { object, boolean } = require('yup');
const Validators = require('../../util/validation');


module.exports = {
  list: {
    query: object({
      taskId: Validators.entityId().canSkip(),
    }).withPagination(),
    body: Validators.ensureEmpty()
  },
  create: {
    body: object({
      taskId: Validators.entityId().required(),
      gitHubToken: Validators.gitHubToken().canSkip(),
      rememberToken: boolean().canSkip()
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
