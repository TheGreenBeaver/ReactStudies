const SmartRouter = require('./_smart-router');
const { User } = require('../models');
const { getB36, generateToken, parseB36, checkToken, TOKEN_STATUS, hash } = require('../util/encrypt');
const sendMail = require('../mail');
const { authenticate } = require('../util/user-identity');
const httpStatus = require('http-status');
const { NON_FIELD_ERR } = require('../settings');
const capitalize = require('lodash/capitalize');
const { origin } = require('../util/env');


class UsersRouter extends SmartRouter {
  constructor() {
    super(User, __filename, {
      AccessRules: {
        create: { isAuthorized: false },
        verify: { isVerified: false },
        getMe: { isAuthorized: true },
        updateMe: { isAuthorized: true, isVerified: true },
      },
    });
  }

  #CRYPTO_FIELDS = ['email', 'firstName', 'lastName'];

  async handleCreate(req, options, res, next) {
    const newUser = await this.Model.create({ ...req.body, password: hash(req.body.password) });

    const verificationToken = generateToken(newUser, this.#CRYPTO_FIELDS);
    const link = `${origin}/confirm/verify/${getB36(newUser.id)}/${verificationToken}`;
    await sendMail(link, newUser.email);

    return authenticate({ email: newUser.email, password: req.body.password }, options);
  }

  handleUpdate(req, options, res, next) {
    return { status: httpStatus.METHOD_NOT_ALLOWED };
  }

  handleRemove(req, options, res, next) {
    return { status: httpStatus.METHOD_NOT_ALLOWED };
  }

  verify = this.apiDecorator(async req => {
    const user = await this.Model.findByPk(parseB36(req.body.uid));
    const status = checkToken(user, req.body.token, this.#CRYPTO_FIELDS);
    if (status === TOKEN_STATUS.OK) {
      user.isVerified = true;
      await user.save();
      return { data: { isVerified: user.isVerified } };
    }
    return { status: httpStatus.BAD_REQUEST, data: { [NON_FIELD_ERR]: [`${capitalize(status)} Link`] } };
  }, SmartRouter.HttpMethods.post, '/verify', 'verify');

  getMe = this.apiDecorator(
    req => ({ data: req.user }), SmartRouter.HttpMethods.get, '/me', 'getMe'
  );

  updateMe = this.apiDecorator(() => {
    // TODO: updateMe
    return { status: httpStatus.NOT_IMPLEMENTED };
  }, SmartRouter.HttpMethods.patch, '/me', 'updateMe');
}

const usersRouter = new UsersRouter();
module.exports = usersRouter.router;
