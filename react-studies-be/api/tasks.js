const SmartRouter = require('./_smart-router');
const { GITHUB_USER_AGENT, MEDIA_DIR } = require('../settings');
const httpStatus = require('http-status');
const { Task, TaskAttachment, ElementRule } = require('../models');
const multerMw = require('../middleware/multer');
const { Octokit } = require('octokit');
const fs = require('fs');
const path = require('path');
const { Task_ForTeacher } = require('../util/query-options');


class TasksRouter extends SmartRouter {
  constructor() {
    const createDestination = (req, file, cb) => {
      const { fieldname } = file;
      const timestamp = multerMw.multerUtils.useSingleTs(req);
      const dir = path.join(MEDIA_DIR, 'tasks', `task-${timestamp}`, fieldname);
      fs.mkdir(dir, { recursive: true }, () => {
        cb(null, dir);
      });
    }
    const createFields = [{ name: 'attachments' }, { name: 'sampleImage', maxCount: 1 }]

    super(Task, __filename, {
      AccessRules: {
        retrieve: { isAuthorized: true, isVerified: true },
        list: { isAuthorized: true, isVerified: true },
        create: { isAuthorized: true, isVerified: true, isTeacher: true },
        update: { isAuthorized: true, isVerified: true, isTeacher: true },
        remove: { isAuthorized: true, isVerified: true, isTeacher: true },
      },
      MulterLogic: {
        create: [createFields, createDestination, { fieldType: multerMw.FIELD_TYPES.fields }]
      }
    });
  }

  getQueryOptions(handlerName, req) {
    if (handlerName === 'retrieve' && req.user.isTeacher) {
      return Task_ForTeacher;
    }
    return super.getQueryOptions(handlerName, req);
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
        return { status: httpStatus.CREATED, data: basicTask };
      case Task.TASK_KINDS.react:
      // TODO
    }
  }
}

const tasksRouter = new TasksRouter();
module.exports = tasksRouter.router;
