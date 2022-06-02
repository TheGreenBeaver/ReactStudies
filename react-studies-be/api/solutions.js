const SmartRouter = require('./_smart-router');
const { Solution } = require('../models');


class SolutionsRouter extends SmartRouter {
  constructor() {
    super(Solution, __filename, {
      AccessRules: {
        update: { never: true }
      },
      DefaultAccessRules: { isAuthorized: true, isVerified: true, isTeacher: false }
    });
  }
}

const solutionsRouter = new SolutionsRouter();
module.exports = solutionsRouter.router;
