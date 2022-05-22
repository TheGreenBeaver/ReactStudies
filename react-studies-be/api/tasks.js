const initRouter = require('./_init-router');
const { NON_FIELD_ERR, GITHUB_USER_AGENT } = require('../settings');
const httpStatus = require('http-status');
const { Task, TaskAttachment, ElementRule } = require('../models');
const paths = require('./_paths');
const applyMulter = require('../middleware/multer');
const { Octokit } = require('octokit');


const router = initRouter();

const fields = [{ name: 'attachments' }, { name: 'sampleImage', maxCount: 1 }];
applyMulter(router, fields, '', {
  fieldType: 'fields'
});

router.post(paths.root, async (req, res, next) => {
  if (!req.user.isTeacher) {
    return res.status(httpStatus.FORBIDDEN).json({
      [NON_FIELD_ERR]: ['Only teachers are allowed to create tasks']
    });
  }

  try {
    const { kind, gitHubToken, title, description, attachments: attachmentFiles, attachmentNames } = req.body;

    const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: gitHubToken });
    const repo = await octokit.rest.repos.createForAuthenticatedUser({ name: title });
    const attachments = attachmentFiles.map((file, idx) => ({
      location: file.path, refName: attachmentNames?.[idx] || `attachment-${idx + 1}`
    }));
    const basicTask = await Task.create({ title, description, repoUrl: repo.html_url, attachments }, {
      include: [{ model: TaskAttachment, as: 'attachments' }]
    });

    switch (kind) {
      case Task.TASK_KINDS.layout:
        const { mustUse, absPos, rawSizing, sampleImage } = req.body;
        const layoutTask = await basicTask.createLayoutTask({
          sampleImage: sampleImage.path,
          absPosMaxUsage: absPos?.maxUsage,
          absPosAllowedFor: absPos?.allowedFor || [],
          rawSizingMaxUsage: rawSizing?.maxUsage,
          rawSizingAllowedFor: rawSizing?.allowedFor || [],
          mustUse: mustUse || []
        }, {
          include: [
            { model: ElementRule, as: 'absPosAllowedFor' },
            { model: ElementRule, as: 'rawSizingAllowedFor' },
            { model: ElementRule, as: 'mustUse' },
          ]
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
