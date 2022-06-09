const SmartRouter = require('./_smart-router');
const { authenticate, extractToken } = require('../util/user-identity');
const { AuthToken } = require('../models');
const httpStatus = require('http-status');


class AuthRouter extends SmartRouter {
  constructor() {
    super(AuthToken, __filename, {
      AccessRules: {
        signIn: { isAuthorized: false },
        logOut: { isAuthorized: true },
      },
      DefaultAccessRules: { never: true }
    });
  }

  signIn = this.apiDecorator((req, options) =>
    authenticate(req.body, options), SmartRouter.HttpMethods.post, '/sign_in', 'signIn'
  );
  logOut = this.apiDecorator(async (req) => {
    await this.Model.destroy({ where: { key: extractToken(req) } });
    req.app.locals.wsServer.logUserOut(req.user);
    return { status: httpStatus.NO_CONTENT };
  }, SmartRouter.HttpMethods.post, '/log_out', 'logOut');
}

const authRouter = new AuthRouter();
module.exports = authRouter.router;
