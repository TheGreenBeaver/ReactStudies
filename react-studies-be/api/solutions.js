const SmartRouter = require('./_smart-router');
const { Solution } = require('../models');


class SolutionsRouter extends SmartRouter {
  constructor() {
    super(Solution, __filename, {
      AccessRules: {
        retrieve: { isAuthorized: true, isVerified: true },
        list: { isAuthorized: true, isVerified: true },
      },
      DefaultAccessRules: { isAuthorized: true, isVerified: true, isTeacher: false }
    });
  }
}

const solutionsRouter = new SolutionsRouter();
module.exports = solutionsRouter.router;
