const initRouter = require('./_init-router');
const { NON_FIELD_ERR, GITHUB_USER_AGENT, MEDIA_DIR } = require('../settings');
const httpStatus = require('http-status');
const { Task, TaskAttachment, ElementRule } = require('../models');
const paths = require('./_paths');
const applyMulter = require('../middleware/multer');
const applyValidation = require('./validation');
const { Octokit } = require('octokit');
const httpMethods = require('./_http-methods');
const fs = require('fs');
const path = require('path');


const router = initRouter();

function multerDestination(req, file, cb) {
  const { fieldname } = file;
  const timestamp = applyMulter.multerUtils.useSingleTs(req);
  const dir = path.join(MEDIA_DIR, 'tasks', `task-${timestamp}`, fieldname);
  fs.mkdir(dir, { recursive: true }, () => {
    cb(null, dir);
  });
}

const fields = [{ name: 'attachments' }, { name: 'sampleImage', maxCount: 1 }];
applyMulter(router, fields, multerDestination, {
  fieldType: 'fields', routes: [{ method: httpMethods.post, route: paths.root }]
});
applyValidation(__filename, router);

router.post(paths.root, async (req, res, next) => {
  if (!req.user.isTeacher) {
    return res.status(httpStatus.FORBIDDEN).json({
      [NON_FIELD_ERR]: ['Only teachers are allowed to create tasks']
    });
  }

  try {
    const {
      kind,
      title,
      description,
      attachments: attachmentFiles,
      attachmentNames,
      trackUpdates,

      gitHubToken,
      rememberToken
    } = req.body;

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
        const { mustUse, absPos, rawSizing, sampleImage } = req.body;
        const mustUseRules = mustUse?.map(r => ({ ...r, ruleName: ElementRule.RULE_NAMES.mustUse })) || [];
        const absPosRules = absPos?.allowedFor?.map(r => ({ ...r, ruleName: ElementRule.RULE_NAMES.absPos })) || [];
        const rawSizingRules = rawSizing?.allowedFor?.map(r => ({ ...r, ruleName: ElementRule.RULE_NAMES.rawSizing })) || [];
        const layoutTask = await basicTask.createLayoutTask({
          sampleImage: sampleImage[0].path,
          absPosMaxUsage: absPos?.maxUsage,
          rawSizingMaxUsage: rawSizing?.maxUsage,
          elementRules: [...mustUseRules, ...absPosRules, ...rawSizingRules],
        }, {
          include: [{ model: ElementRule, as: 'elementRules' }],
        });
        return res.status(httpStatus.CREATED).json(layoutTask);
      case Task.TASK_KINDS.react:
        // TODO
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
