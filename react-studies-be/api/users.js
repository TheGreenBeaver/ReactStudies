const SmartRouter = require('./_smart-router');
const { User, sequelize } = require('../models');
const { getB36, generateToken, parseB36, checkToken, TOKEN_STATUS, hash } = require('../util/encrypt');
const sendMail = require('../mail');
const { authenticate } = require('../util/user-identity');
const httpStatus = require('http-status');
const { NON_FIELD_ERR } = require('../settings');
const capitalize = require('lodash/capitalize');
const { origin } = require('../util/env');
const cloneDeep = require('lodash/cloneDeep');
const { Op } = require('sequelize');


class UsersRouter extends SmartRouter {
  constructor() {
    super(User, __filename, {
      AccessRules: {
        create: { isAuthorized: false },
        list: { isAuthorized: true, isVerified: true },
        verify: { isVerified: false },
        retrieve: { isAuthorized: true, isVerified: true },
        retrieveMe: { isAuthorized: true },
        updateMe: { isAuthorized: true, isVerified: true },
      },
      DefaultAccessRules: { never: true }
    });
  }

  getQueryOptions(handlerName, req) {
    const options = cloneDeep(super.getQueryOptions(handlerName, req));
    const { query } = req;

    if (handlerName === 'list') {
      const where = [];
      if ('q' in query) {
        where.push(sequelize.where(sequelize.fn(
          'concat_ws',
          ' ',
          sequelize.col('first_name'),
          sequelize.col('last_name'),
        ), { [Op.iLike]: `%${query.q}%` }));
      }
      if ('isTeacher' in query) {
        where.push({ is_teacher: query.isTeacher });
      }
      if (where.length) {
        options.where = where;
      }

    }

    return options;
  }

  #CRYPTO_FIELDS = ['email', 'firstName', 'lastName'];

  async handleCreate(req, options, res, next) {
    const newUser = await this.Model.create({ ...req.body, password: hash(req.body.password) });

    const verificationToken = generateToken(newUser, this.#CRYPTO_FIELDS);
    const link = `${origin}/confirm/verify/${getB36(newUser.id)}/${verificationToken}`;
    await sendMail(link, newUser.email);

    return authenticate({ email: newUser.email, password: req.body.password }, options);
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

  retrieveMe = this.apiDecorator(
    req => ({ data: req.user }), SmartRouter.HttpMethods.get, '/me', 'retrieveMe'
  );

  updateMe = this.apiDecorator(() => {
    // TODO: updateMe
    return { status: httpStatus.NOT_IMPLEMENTED };
  }, SmartRouter.HttpMethods.patch, '/me', 'updateMe');
}

const usersRouter = new UsersRouter();
module.exports = usersRouter.router;
