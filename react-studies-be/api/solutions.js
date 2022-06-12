const SmartRouter = require('./_smart-router');
const { Solution, Task, User, LayoutTask, ReactTask, SolutionResult, TemplateConfig } = require('../models');
const { Octokit } = require('octokit');
const { GITHUB_USER_AGENT, WEBHOOKS_PATH } = require('../settings');
const httpStatus = require('http-status');
const { publicUrl, getVar } = require('../util/env');
const pick = require('lodash/pick');
const cloneDeep = require('lodash/cloneDeep');
const { downloadArtifacts, uploadFiles } = require('../util/github');
const { User_Private, Any_Dummy } = require('../util/query-options');
const { Op } = require('sequelize');
const isEmpty = require('lodash/isEmpty');
const startCase = require('lodash/startCase');
const camelCase = require('lodash/camelCase');
const capitalize = require('lodash/capitalize');
const { getBase64 } = require('../util/misc');


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
          result.getDataValue('unprocessedReportLocation')
        );
      }
    }
    return { status: httpStatus.ACCEPTED };
  }, SmartRouter.HttpMethods.post, '/urgent_token', 'urgentToken');

  static #configFields = ['routes', 'endpoints', 'special'];
  static #configFlags = {
    [TemplateConfig.TEMPLATE_KINDS.authTemplate]: ['hasVerification'],
    [TemplateConfig.TEMPLATE_KINDS.entityListTemplate]: ['hasSearch']
  };

  async handleCreate(req, options, res, next) {
    const { body, user, app } = req;
    const { locals: { wsServer } } = app;
    const { task, gitHubToken, rememberToken } = body;

    if (rememberToken && gitHubToken) {
      user.gitHubToken = gitHubToken;
      await user.save();
    }

    const [rootOwner, rootRepo] = task.repoUrl.split('/').slice(-2);
    const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: user.gitHubToken });
    const { data: fork } = await octokit.rest.repos.createFork({ owner: rootOwner, repo: rootRepo });
    const solution = this.Model.build({
      repoUrl: fork.html_url,
      task_id: task.id,
      repoId: fork.id,
      student_id: user.id
    });

    const owner = fork.owner.login;
    const repo = fork.name;

    switch (task.kind) {
      case Task.TASK_KINDS.layout: {
        await solution.save();
        break;
      }

      case Task.TASK_KINDS.react: {
        const { dumpUploadUrl, dumpUploadMethod } = body;

        solution.dumpUploadUrl = dumpUploadUrl;
        solution.dumpUploadMethod = dumpUploadMethod;
        await solution.save();

        const cypressEnv = {};

        if (task.reactTask.dump) {
          cypressEnv.dumpConfig = {
            dump: task.reactTask.dump,
            dumpUploadUrl: dumpUploadUrl || ask.reactTask.dumpUploadUrl,
            dumpUploadMethod: dumpUploadMethod || ask.reactTask.dumpUploadMethod,
          };
        }

        for (const templateKind of Object.entries(TemplateConfig.TEMPLATE_KINDS)) {
          const [name, dbValue] = templateKind;

          const teacherConfig = task.reactTask.teacherTemplateConfigs.find(cfg => cfg.kind === dbValue);
          if (!teacherConfig) {
            continue;
          }

          const splitName = startCase(name).split(' ');
          const prefix = camelCase(splitName.slice(0, splitName.length - 1));

          cypressEnv[prefix] = {};

          const toPick = SolutionsRouter.#configFields.map(shallowField => `${prefix}${capitalize(shallowField)}`);
          const studentConfig = pick(body, toPick);

          if (!isEmpty(studentConfig)) {
            await solution.createStudentTemplateConfig({ kind: dbValue, ...studentConfig });
          }
          SolutionsRouter.#configFields.forEach(field => {
            cypressEnv[prefix][field] = studentConfig[`${prefix}${capitalize(field)}`] || teacherConfig[field];
          });
          SolutionsRouter.#configFlags[dbValue].forEach(field => {
            cypressEnv[prefix][field] = task.reactTask[field];
          });
        }

        uploadFiles(octokit, repo, { plain: {
          'test-engine/cypress.env.json': getBase64(JSON.stringify(cypressEnv))
        }});
      }
    }

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
