const SmartRouter = require('./_smart-router');
const { GITHUB_USER_AGENT, MEDIA_DIR } = require('../settings');
const httpStatus = require('http-status');
const { Task, TaskAttachment, ElementRule, ReactTaskPage } = require('../models');
const multerMw = require('../middleware/multer');
const { Octokit } = require('octokit');
const fs = require('fs');
const path = require('path');
const cloneDeep = require('lodash/cloneDeep');
const { Op } = require('sequelize');
const isEmpty = require('lodash/isEmpty');
const now = require('lodash/now');
const pick = require('lodash/pick');


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
    const createFields = [{ name: 'attachments' }, { name: 'sampleImage', maxCount: 1 }]

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
      case 'retrieve': {
        if (!req.user.isTeacher) {
          options.include = options.include.map(includedModel =>
            includedModel.as === 'solutions'
              ? { ...includedModel, where: { student_id: req.user.id } }
              : includedModel
          );
        }
        break;
      }
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
      }
    }

    return options;
  }

  async handleCreate(req, options, res, next) {
    const {
      kind,
      title,
      description,
      attachmentNames,
      trackUpdates,

      gitHubToken,
      rememberToken
    } = req.body;
    const { attachments: attachmentFiles } = req.files;

    if (rememberToken && gitHubToken) {
      req.user.gitHubToken = gitHubToken;
      await req.user.save();
    }
    const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: req.user.gitHubToken });
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({ name: title });
    const attachments = [];
    for (const idx in attachmentFiles) {
      const { mimetype, destination, filename, path: filePath } = attachmentFiles[idx];
      const refName = attachmentNames[idx];
      const location = path.join(destination, `${refName}${path.extname(filename)}`);
      await fs.promises.rename(filePath, location);
      attachments.push({ location, refName, mime: mimetype });
    }
    const basicTask = await req.user.createTask({ title, description, repoUrl: repo.html_url, attachments, trackUpdates }, {
      include: [{ model: TaskAttachment, as: 'attachments' }]
    });

    switch (kind) {
      case Task.TASK_KINDS.layout:
        const { mustUse, absPos, rawSizing } = req.body;
        const { sampleImage } = req.files;
        const mustUseRules = mustUse?.map(r => ({ ...r, ruleName: ElementRule.RULE_NAMES.mustUse })) || [];
        const absPosRules = absPos?.allowedFor?.map(r => ({ ...r, ruleName: ElementRule.RULE_NAMES.absPos })) || [];
        const rawSizingRules = rawSizing?.allowedFor?.map(r => ({ ...r, ruleName: ElementRule.RULE_NAMES.rawSizing })) || [];
        await basicTask.createLayoutTask({
          sampleImage: sampleImage[0].path,
          absPosMaxUsage: absPos?.maxUsage,
          rawSizingMaxUsage: rawSizing?.maxUsage,
          elementRules: [...mustUseRules, ...absPosRules, ...rawSizingRules],
        }, {
          include: [{ model: ElementRule, as: 'elementRules' }],
        });
        break;
      case Task.TASK_KINDS.react:
        const { includeFuzzing, pages: rawPages } = req.body;
        const { fileDumps } = req.files;
        const pages = rawPages.map(rawPage => {
          const dump = rawPage.textDump || fileDumps?.[rawPage.fileDumpIdx];
          const dumpIsFile = dump ? !rawPage.textDump : null;
          return { ...pick(rawPage, ['endpoints', 'template', 'dumpIsTemplate', 'route']), dump, dumpIsFile };
        });
        await basicTask.createReactTask({ includeFuzzing, pages }, { include: [{ model: ReactTaskPage, as: 'pages' }] });
    }

    return { status: httpStatus.CREATED, data: basicTask };
  }
}

const tasksRouter = new TasksRouter();
module.exports = tasksRouter.router;
