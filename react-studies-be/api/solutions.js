const SmartRouter = require('./_smart-router');
const { Solution, Task, User, LayoutTask, ReactTask, SolutionResult } = require('../models');
const { DataError } = require('../util/custom-errors');
const { Octokit } = require('octokit');
const { GITHUB_USER_AGENT, WEBHOOKS_PATH } = require('../settings');
const httpStatus = require('http-status');
const { publicUrl, getVar } = require('../util/env');
const pick = require('lodash/pick');
const cloneDeep = require('lodash/cloneDeep');
const { downloadArtifacts } = require('../util/github');
const { User_Private, Any_Dummy } = require('../util/query-options');
const { Op } = require('sequelize');
const isEmpty = require('lodash/isEmpty');


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

  getQueryOptions(handlerName, req) {
    const options = cloneDeep(super.getQueryOptions(handlerName, req));
    if (handlerName === 'list') {
      const where = {};
      if ('taskId' in req.query) {
        where['$task.id$'] = req.query.taskId;
      }
      if (!req.user.isTeacher) {
        where['$student.id$'] = req.user.id;
      }
      if (!isEmpty(where)) {
        options.where = where;
      }
    }
    return options;
  }

  urgentToken = this.apiDecorator(async req => {
    const { user, body } = req;
    const { gitHubToken, rememberToken } = body;

    if (rememberToken) {
      user.gitHubToken = gitHubToken;
      await user.save();
    }

    const toProcess = await user.getSolutions({
      include: [{
        model: SolutionResult,
        as: 'results',
        where: { unprocessedReportLocation: { [Op.not]: null } },
        attributes: ['unprocessedReportLocation', 'runId'],
        required: true
      }, {
        model: User, as: 'student', ...User_Private
      }, {
        model: Task, as: 'task', ...Any_Dummy,
        include: [{
          model: LayoutTask,
          as: 'layoutTask'
        }, {
          model: ReactTask,
          as: 'reactTask'
        }]
      }],
      attributes: ['id', 'repoUrl'],
      rejectOnEmpty: false
    });

    for (const solution of toProcess) {
      const [owner, repo] = solution.repoUrl.split('/').slice(-2);
      for (const result of solution.results) {
        downloadArtifacts(
          gitHubToken,
          owner,
          repo,
          result.runId,
          req.app.locals.wsServer,
          result,
          solution,
          result.unprocessedReportLocation
        );
      }
    }
    return { status: httpStatus.ACCEPTED };
  }, SmartRouter.HttpMethods.post, '/urgent_token', 'urgentToken');

  async handleCreate(req, options, res, next) {
    const { body, user, app } = req;
    const { locals: { wsServer } } = app;
    const { taskId, gitHubToken, rememberToken } = body;
    const task = await Task.findByPk(taskId, {
      attributes: ['repoUrl', 'id'],
      rejectOnEmpty: new DataError({ taskId: ['No such task'] })
    });

    if (rememberToken && gitHubToken) {
      user.gitHubToken = gitHubToken;
      await user.save();
    }

    const [rootOwner, rootRepo] = task.repoUrl.split('/').slice(-2);
    const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: user.gitHubToken });
    const { data: fork } = await octokit.rest.repos.createFork({ owner: rootOwner, repo: rootRepo });
    const solution = await user.createSolution({
      repoUrl: fork.html_url,
      task_id: task.id,
      repoId: fork.id
    });

    const owner = fork.owner.login;
    const repo = fork.name;
    octokit.rest.repos.getContent({
      owner, repo,
      path: '.github/workflows/main.yml',
    }).then(({ data: { content, sha } }) => Promise.all([
      octokit.rest.repos.createOrUpdateFileContents({
        owner, repo,
        path: '.github/workflows/main-enabled.yml',
        content,
        message: 'Enabling workflow',
      }),
      octokit.rest.repos.deleteFile({
        owner, repo,
        path: '.github/workflows/main.yml',
        message: 'Enabling workflow',
        sha,
      }),
      octokit.rest.repos.createWebhook({
        owner, repo,
        events: ['workflow_run'],
        config: {
          url: `${publicUrl}${WEBHOOKS_PATH}`,
          secret: getVar('WEBHOOKS_SECRET'),
          content_type: 'json'
        },
      }),
    ])).then(() =>
      wsServer.sendToUser(user, wsServer.Actions.solutionRepositoryPopulated, pick(solution, ['id', 'repoUrl']))
    );

    return { data: solution, status: httpStatus.CREATED };
  }
}

const solutionsRouter = new SolutionsRouter();
module.exports = solutionsRouter.router;
