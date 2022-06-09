const SmartRouter = require('./_smart-router');
const { SolutionResult } = require('../models');
const cloneDeep = require('lodash/cloneDeep');


class SolutionResultsRouter extends SmartRouter {
  constructor() {
    super(SolutionResult, __filename, {
      AccessRules: {
        list: { isAuthorized: true, isVerified: true },
        retrieve: { isAuthorized: true, isVerified: true },
      },
      DefaultAccessRules: { never: true }
    });
  }

  getQueryOptions(handlerName, req) {
    const options = cloneDeep(super.getQueryOptions(handlerName, req));
    if (handlerName === 'list') {
      options.where = { '$solution.id$': req.query.solutionId };
    }
    return options;
  }
}

const solutionResultsRouter = new SolutionResultsRouter();
module.exports = solutionResultsRouter.router;
