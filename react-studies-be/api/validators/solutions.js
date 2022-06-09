const { object, boolean } = require('yup');
const Validators = require('../../util/validation');


module.exports = {
  create: {
    body: object({
      taskId: Validators.entityId().required(),
      gitHubToken: Validators.gitHubToken(),
      rememberToken: boolean().canSkip()
    }).noUnknown(),
    query: Validators.ensureEmpty()
  },
  update: object({

  }).noUnknown()
}
