const { object } = require('yup');
const Validators = require('../../util/validation');


module.exports = {
  list: {
    query: object({
      solutionId: Validators.entityId().required()
    }).withPagination(),
    body: Validators.ensureEmpty()
  },
}
