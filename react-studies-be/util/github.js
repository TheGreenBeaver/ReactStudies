const { Octokit } = require('octokit');
const { getFilesRecursively, standardizePath } = require('./misc');
const fs = require('fs');
const path = require('path');
const partition = require('lodash/partition');


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
    : ({ path: [prefix, key].filter(Boolean).join('/'), content: Buffer.from(val).toString('base64') })
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

module.exports = {
  uploadFiles
}
