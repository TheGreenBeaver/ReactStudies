const paths = require('../_paths');
const httpMethods = require('../_http-methods');
const Validators = require('../../util/validation');
const { boolean, string, object } = require('yup');

module.exports = [
  {
    path: paths.root,
    method: httpMethods.post,
    validator: Validators.strictObject({
      email: string().email(),
      firstName: string().max(30),
      lastName: string().max(30),
      isTeacher: boolean(),
      password: string().max(100),
    })
  },
  {
    path: paths.verify,
    method: httpMethods.post,
    validator: Validators.strictObject({
      uid: string().matches(/[\da-z]+/),
      token: string(),
    })
  },
  {
    path: paths.me,
    method: httpMethods.get,
    validator: Validators.ensureEmpty()
  },
  {
    path: paths.me,
    method: httpMethods.patch,
    validator: object({
      firstName: string().max(30).optional(),
      lastName: string().max(30).optional(),
      password: string().max(100).optional()
    }).noUnknown()
  }
];
