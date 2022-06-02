const Validators = require('../../util/validation');
const { boolean, string, object } = require('yup');


module.exports = {
  retrieve: {
    body: Validators.ensureEmpty(),
    query: object({
      mini: boolean().optional()
    }).noUnknown()
  },
  list: {
    body: Validators.ensureEmpty(),
    query: object({
      q: string().optional(),
      isTeacher: boolean().optional()
    }).withPagination()
  },
  create: {
    body: Validators.strictObject({
      email: string().email(),
      firstName: string().max(30),
      lastName: string().max(30),
      isTeacher: boolean(),
      password: string().max(100),
    }),
    query: Validators.ensureEmpty()
  },
  verify: {
    body: Validators.strictObject({
      uid: string().matches(/[\da-z]+/),
      token: string(),
    }),
    query: Validators.ensureEmpty()
  },
  retrieveMe: {
    body: Validators.ensureEmpty(),
    query: Validators.ensureEmpty()
  },
  updateMe: {
    body: object({
      firstName: string().max(30).optional(),
      lastName: string().max(30).optional(),
      password: string().max(100).optional()
    }).noUnknown(),
    query: Validators.ensureEmpty()
  }
};
