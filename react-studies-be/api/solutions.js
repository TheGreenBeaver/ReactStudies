const SmartRouter = require('./_smart-router');
const { Solution, Task } = require('../models');
const { DataError } = require('../util/custom-errors');
const { Octokit } = require('octokit');
const { GITHUB_USER_AGENT, WEBHOOKS_PATH } = require('../settings');
const httpStatus = require('http-status');
const { publicUrl, getVar } = require('../util/env');
const pick = require('lodash/pick');


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
