const { strictObject, ensureEmpty } = require('../../util/validation');
const { string } = require('yup');
const paths = require('../_paths');
const httpMethods = require('../_http-methods');

module.exports = [
  {
    method: httpMethods.post,
    path: paths.signIn,
    validator: strictObject({
      email: string().email(),
      password: string().max(100)
    })
  },
  {
    method: httpMethods.post,
    path: paths.logOut,
    validator: ensureEmpty
  }
];
