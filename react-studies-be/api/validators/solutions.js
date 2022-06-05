const { object } = require('yup');
const Validators = require('../../util/validation');


module.exports = {
  create: {
    body: object({
      taskId: Validators.entityId().required()
    }).noUnknown(),
    query: Validators.ensureEmpty()
  },
  update: object({

  }).noUnknown()
}
