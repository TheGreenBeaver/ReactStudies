const { Octokit } = require('octokit');
const { getFilesRecursively, standardizePath } = require('./misc');
const fs = require('fs');
const path = require('path');
const partition = require('lodash/partition');
const { GITHUB_USER_AGENT, MEDIA_DIR, TEMP_DIR } = require('../settings');
const now = require('lodash/now');
const unzip = require('./unzip');
const { SolutionResult, Task } = require('../models');
const pick = require('lodash/pick');


function getRegexFromRule(rule) {
  const ruleBody = rule
    .replace(/\\/g, '/')
    .replace(/\./g, '\\.')
    .replace(/(\*\*\/)|(\*)/g, match => match.length === 1 ? '[^/]*' : '.*')
    .replace(/\?/g, '[^/]{1}');
  return new RegExp(`^${ruleBody}`);
}

async function parseGitignore(dir) {
  try {
    const content = await fs.promises.readFile(path.join(dir, '.gitignore'), 'utf-8');
    const rules = content.split(/[\n\r]/g).filter(Boolean);
    const [keep, ignore] = partition(rules, rule => rule.startsWith('!'));
    return {
      keepRules: keep.map(fPath => getRegexFromRule(path.join(dir, fPath.substring(1)))),
      ignoreRules: ignore.map(fPath => getRegexFromRule(path.join(dir, fPath)))
    };
  } catch {
    return { keepRules: [], ignoreRules: [] };
  }
}

function unpack(obj, prefix = '') {
  return Object.entries(obj).map(([key, val]) => val.constructor.name === 'Object'
    ? unpack(val, [prefix, key].filter(Boolean).join('/'))
    : ({ path: [prefix, key].filter(Boolean).join('/'), content: val })
  ).flat();
}

/**
 * @typedef {Object} Dir
 * @property {string} dir
 * @property {string} mount
 * @property {(function(filePath: string): boolean)=} ignore
 * @property {(function(filePath: string): boolean)=} keep
 */

/**
 *
 * @param {Octokit} octokit
 * @param {string} repo
 * @param {string} [message = 'Generating template']
 * @param {Array<Dir>=} dirs
 * @param {Object=} plain
 * @return {Promise<void>}
 */
async function uploadFiles(octokit, repo, {
  message = 'Generating template', dirs, plain
} = {}) {
  const toCreate = [];
  if (dirs) {
    for (const { dir, mount, keep, ignore } of dirs) {
      const { keepRules, ignoreRules } = await parseGitignore(dir);
      const allFilePaths = await getFilesRecursively(dir);
      const filePaths = allFilePaths.filter(rawFilePath => {
        const filePath = standardizePath(rawFilePath);
        const shouldIgnore = ignoreRules.some(ignoreRule => ignoreRule.test(filePath)) || ignore?.(filePath);
        const shouldKeep = keepRules.some(keepRule => keepRule.test(filePath) || keep?.(filePath));
        return !shouldIgnore || shouldKeep;
      });

      for (const filePath of filePaths) {
        const content = await fs.promises.readFile(filePath, 'base64');
        const relativePath = path.relative(dir, filePath);
        const mountedPath = mount ? path.join(mount, relativePath) : relativePath;
        toCreate.push({ path: standardizePath(mountedPath), content });
      }
    }
  }

  if (plain) {
    toCreate.push(...unpack(plain));
  }

  const { data: { login } } = await octokit.rest.users.getAuthenticated();
  for (const fileData of toCreate) {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: login, repo, ...fileData, message
    });
  }
}

async function downloadArtifacts(gitHubToken, owner, repo, run_id, wsServer, solutionResult, solution) {
  const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: gitHubToken });
  const taskKind = solution.task.kind;

  const { data: { artifacts } } = await octokit.rest.actions.listWorkflowRunArtifacts({ owner, repo, run_id });

  const { data: reportsArchive } = await octokit.rest.actions.downloadArtifact({
    owner, repo,
    artifact_id: artifacts[0].id,
    archive_format: 'zip'
  });

  const tempDest = path.join(TEMP_DIR, `${now()}.zip`);
  await fs.promises.writeFile(tempDest, Buffer.from(reportsArchive));
  const dest = path.join(MEDIA_DIR, 'solution-results', taskKind, now().toString());
  await new Promise((resolve, reject) => unzip(tempDest, dest, e => e ? reject(e) : resolve()));
  await fs.promises.rm(tempDest);

  switch (taskKind) {
    case Task.TASK_KINDS.layout: {
      let points = 0;
      const values = { reportLocation: path.join(dest, 'report.json') };

      const report = await fs.promises.readFile(values.reportLocation, 'utf8');
      const {
        summary: {
          diffPercentage,
          absPosUsage,
          rawSizingUsage,
          includedMustUseTags,
          properlyTaggedTextBlocks,
        },
      } = JSON.parse(report);

      const diffPresent = diffPercentage != null && diffPercentage > 0.07;
      if (diffPresent) {
        values.diffLocation =
          path.join(dest, 'cypress', 'snapshots', 'main.spec.js', '__diff_output__', 'task.diff.png')
      }

      const { absPosMaxUsage, rawSizingMaxUsage } = solution.task.layoutTask;
      const trackAbsPos = absPosMaxUsage != null;
      const trackRawSizing = rawSizingMaxUsage != null;

      const nonUsageMax = 100 - (trackAbsPos ? 15 : 0) - (trackRawSizing ? 15 : 0);
      const snapMax = 4 * nonUsageMax / 7;
      const usedMax = 3 * nonUsageMax / 7;

      if (diffPercentage) {
        const fixedPercentage = Math.max(Math.min(diffPercentage, 9.07), 0.07);
        points += snapMax - (fixedPercentage - 0.07) / 9 * snapMax;
      }

      const mustUsePoints = (
        (includedMustUseTags == null ? 100 : includedMustUseTags) +
        (properlyTaggedTextBlocks == null ? 100 : properlyTaggedTextBlocks)
      ) / 2 * (usedMax / 100);
      points += mustUsePoints;

      if (trackAbsPos) {
        const fixedUsage = Math.max(absPosUsage, absPosMaxUsage);
        points += 15 - fixedUsage / 15 * absPosMaxUsage;
      }

      if (trackRawSizing) {
        const fixedUsage = Math.max(rawSizingUsage, rawSizingMaxUsage);
        points += 15 - fixedUsage / 15 * rawSizingMaxUsage;
      }

      if (points < 34) {
        solutionResult.summary = SolutionResult.SUMMARY.bad;
      } else if (points < 67) {
        solutionResult.summary = SolutionResult.SUMMARY.medium;
      } else {
        solutionResult.summary = SolutionResult.SUMMARY.good;
      }

      solutionResult.isProcessed = true;
      await solutionResult.save();
      await solutionResult.createLayoutResult(values);
      break;
    }
    case Task.TASK_KINDS.react: {

    }
  }

  return wsServer.sendToUser(solution.student, wsServer.Actions.workflowResultsReady, {
    solution: pick(solution, ['id', 'task_id']),
    result: pick(solutionResult, ['summary', 'createdAt', 'runId', 'id']),
  });
}

module.exports = {
  uploadFiles, downloadArtifacts
}
