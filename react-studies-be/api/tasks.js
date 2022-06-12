const SmartRouter = require('./_smart-router');
const { GITHUB_USER_AGENT, MEDIA_DIR, REPO_TEMPLATES_DIR } = require('../settings');
const httpStatus = require('http-status');
const { Task, TaskAttachment, ElementRule, TemplateConfig } = require('../models');
const multerMw = require('../middleware/multer');
const { Octokit } = require('octokit');
const fs = require('fs');
const path = require('path');
const cloneDeep = require('lodash/cloneDeep');
const { Op } = require('sequelize');
const isEmpty = require('lodash/isEmpty');
const now = require('lodash/now');
const sizeOf = require('image-size')
const pick = require('lodash/pick');
const omit = require('lodash/omit');
const { uploadFiles } = require('../util/github');
const { getBase64 } = require('../util/misc');
const { Task_List } = require('../util/query-options');


class TasksRouter extends SmartRouter {
  constructor() {
    const createDestination = (req, file, cb) => {
      const { fieldname } = file;
      const timestamp = multerMw.multerUtils.useSingleTs(req);
      const dir = path.join(MEDIA_DIR, 'tasks', `task-${timestamp}`, fieldname);
      fs.mkdir(dir, { recursive: true }, () => {
        cb(null, dir);
      });
    };
    const createFilename = (req, file, cb) => {
      const uniquePrefix = now();
      cb(null, `${uniquePrefix}${path.extname(file.originalname)}`);
    };
    const createFields = [
      { name: 'attachments' },
      { name: 'sampleImage', maxCount: 1 },
      { name: 'fileDump', maxCount: 1 }
    ];

    super(Task, __filename, {
      AccessRules: {
        retrieve: { isAuthorized: true, isVerified: true },
        list: { isAuthorized: true, isVerified: true },
      },
      DefaultAccessRules: { isAuthorized: true, isVerified: true, isTeacher: true },
      MulterLogic: {
        create: [createFields, createDestination, { fieldType: multerMw.FIELD_TYPES.fields, filename: createFilename }]
      }
    });
  }

  getQueryOptions(handlerName, req) {
    const options = cloneDeep(super.getQueryOptions(handlerName, req));

    switch (handlerName) {
      case 'list': {
        const { query } = req;
        const where = {};
        if ('teacherId' in query) {
          where.teacher_id = query.teacherId;
        }
        if ('q' in query) {
          where.title = { [Op.iLike]: `%${query.q}%` };
        }
        if ('kind' in query) {
          options.include = options.include.map(includedModel =>
            includedModel.as === `${query.kind}Task`
              ? { ...includedModel, required: true }
              : includedModel,
          );
        }
        if (!isEmpty(where)) {
          options.where = where;
        }
        break;
      }
      case 'retrieve': {
        if (req.query.mini) {
          return Task_List;
        }
      }
    }

    return options;
  }

  static #getSampleHtml(sampleExt) {
    return (
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
</head>
<body style='margin: 0; padding: 0; box-sizing: border-box'>
<img src='./sample${sampleExt}' alt='sample' />
</body>
</html>`);
  }

  async handleCreate(req, options, res, next) {
    const { body, user, files } = req;
    const {
      kind,
      title,
      description,
      attachmentNames,
      trackUpdates,

      gitHubToken,
      rememberToken
    } = body;
    const { attachments: attachmentFiles } = files;

    if (rememberToken && gitHubToken) {
      user.gitHubToken = gitHubToken;
      await user.save();
    }

    const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: user.gitHubToken });
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({ name: title });

    const attachments = [];
    for (const idx in attachmentFiles) {
      const { mimetype, destination, filename, path: filePath } = attachmentFiles[idx];
      const refName = attachmentNames[idx];
      const location = path.join(destination, `${refName}${path.extname(filename)}`);
      try {
        await fs.promises.rename(filePath, location);
        attachments.push({ location, refName, mime: mimetype });
      } catch {}
    }
    const basicTask = await user.createTask({
      title,
      description,
      repoUrl: repo.html_url,
      attachments,
      trackUpdates,
      repoId: repo.id
    }, {
      include: [{ model: TaskAttachment, as: 'attachments' }]
    });

    const { app: { locals: { wsServer } } } = req;

    switch (kind) {
      case Task.TASK_KINDS.layout:
        const { mustUse, absPos, rawSizing } = body;
        const sampleImage = files.sampleImage[0].path;
        const mustUseRules = mustUse?.map(r => ({ ...r, kind: ElementRule.RULE_KINDS.mustUse })) || [];
        const absPosRules = absPos?.allowedFor?.map(r => ({ ...r, kind: ElementRule.RULE_KINDS.absPos })) || [];
        const rawSizingRules = rawSizing?.allowedFor?.map(r => ({ ...r, kind: ElementRule.RULE_KINDS.rawSizing })) || [];
        await basicTask.createLayoutTask({
          sampleImage,
          absPosMaxUsage: absPos?.maxUsage,
          rawSizingMaxUsage: rawSizing?.maxUsage,
          elementRules: [...mustUseRules, ...absPosRules, ...rawSizingRules],
        }, {
          include: [{ model: ElementRule, as: 'elementRules' }],
        });

        const dimensions = await new Promise((resolve, reject) => sizeOf(sampleImage, (err, dim) =>
          err ? reject(err) : resolve(dim)
        ));
        const cypressEnv = JSON.stringify({
          dimensions, mustUse, absPosAllowedFor: absPos?.allowedFor, rawSizingAllowedFor: rawSizing?.allowedFor
        }, null, '  ');
        const sampleImageContent = await fs.promises.readFile(sampleImage, 'base64');
        const sampleExt = path.extname(sampleImage);
        const extraFilesToUpload = {
          tech: {
            [`sample${sampleExt}`]: sampleImageContent,
            ['sample.html']: getBase64(TasksRouter.#getSampleHtml(sampleExt))
          },
          'cypress.env.json': getBase64(cypressEnv),
          'README.md': getBase64(description)
        };
        const dirs = [{
          dir: path.join(REPO_TEMPLATES_DIR, 'layout'),
          ignore: filePath => /(src\/.*$)|(tech\/sample\.\w+$)/.test(filePath),
          keep: filePath => filePath.endsWith('/layout/src/index.html')
        }];
        if (attachmentFiles) {
          dirs.push({
            dir: attachmentFiles[0].destination,
            mount: 'attachments'
          });
        }
        uploadFiles(octokit, repo.name, {
          dirs, plain: extraFilesToUpload
        }).then(() => wsServer.sendToUser(
          user,
          wsServer.Actions.taskRepositoryPopulated,
          pick(basicTask, ['id', 'title']))
        );
        break;

      case Task.TASK_KINDS.react:
        const pureFields = ['hasFuzzing', 'dump', 'dumpIsTemplate', 'dumpUploadUrl', 'dumpUploadMethod'];
        const configFields = ['endpoints', 'routes', 'special']
        const templateFields = Object.keys(TemplateConfig.TEMPLATE_KINDS);
        const values = pick(body, pureFields);
        const teacherTemplateConfigs = [];
        const templateConfigs = pick(body, templateFields);
        Object.entries(templateConfigs).forEach(([templateName, config]) => {
          const configValues = pick(config, configFields);
          Object.assign(values, omit(config, configFields));
          teacherTemplateConfigs.push({
            ...configValues,
            kind: TemplateConfig.TEMPLATE_KINDS[templateName]
          });
        });
        await basicTask.createReactTask(
          { ...values, dumpUploadMethod: body.dumpUploadMethod || null, teacherTemplateConfigs },
          { include: [{ model: TemplateConfig, as: 'teacherTemplateConfigs' }] }
        );

        uploadFiles(octokit, repo.name, {
          dirs: [{
            dir: path.join(REPO_TEMPLATES_DIR, 'react'),
            ignore: filePath => /(app-backend|app-frontend)\/.*$/.test(filePath),
            keep: filePath => filePath.endsWith('app-backend/.github/actions/run-backend/action.yml')
          }]
        }).then(() => wsServer.sendToUser(
          user,
          wsServer.Actions.taskRepositoryPopulated,
          pick(basicTask, ['id', 'title']))
        );
        break;
    }

    return { status: httpStatus.CREATED, data: basicTask };
  }
}

const tasksRouter = new TasksRouter();
module.exports = tasksRouter.router;
