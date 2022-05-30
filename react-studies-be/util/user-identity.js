const { AuthToken, User } = require('../models');
const { StatusError } = require('./custom-errors');
const httpStatus = require('http-status');
const { compareHashed } = require('./encrypt');
const { NON_FIELD_ERR } = require('../settings');
const { AuthToken_Authorization } = require('./query-options');


function extractToken(req) {
  const header = req.get('Authorization');
  return header ? header.replace('Token ', '') : null;
}

async function authorize(token) {
  return AuthToken.findByPk(token,{
    ...AuthToken_Authorization,
    rejectOnEmpty: new StatusError(httpStatus.UNAUTHORIZED)
  });
}

async function authenticate({ email, password }, options) {
  const user = await User.findOne({ where: { email }, ...options, rejectOnEmpty: false });

  if (!user || !compareHashed(password, user.password)) {
    return { data: { [NON_FIELD_ERR]: ['Invalid credentials'] }, status: httpStatus.BAD_REQUEST };
  }

  const authToken = await user.createAuthToken();
  return { data: { token: authToken.key } };
}

module.exports = {
  authorize,
  authenticate,
  extractToken
};
