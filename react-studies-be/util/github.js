const { Octokit } = require('octokit');
const { GITHUB_USER_AGENT } = require('../settings');
const httpStatus = require('http-status');
const { getFilesRecursively } = require('./misc');
const fs = require('fs');
const path = require('path');


/**
 * @typedef {Object} GHObj
 * @property {Octokit} octokit
 * @property {{ id: number, login: string, name: string, email: string }} user
 */

/**
 *
 * @param req
 * @return {Promise<(function | GHObj)>}
 */
async function getOctokit(req) {
  const gitHubToken = req.user.gitHubToken || req.body.gitHubToken;
  if (!gitHubToken) {
    return res => res.status(httpStatus.BAD_REQUEST).send({ gitHubToken: ['No token found'] });
  }
  const octokit = new Octokit({ userAgent: GITHUB_USER_AGENT, auth: gitHubToken });
  const user = await octokit.rest.users.getAuthenticated();
  return { octokit, user };
}

function unpack(obj, prefix = '') {
  return Object.entries(obj).map(([key, val]) => val.constructor.name === 'Object'
    ? unpack(val, [prefix, key].join('/'))
    : ({ path: [prefix, key].join('/'), content: Buffer.from(val).toString('base64') })
  ).flat();
}

/**
 * @typedef {Object} Dir
 * @property {string} dir
 * @property {string} place
 * @property {(function(fPath: string): boolean)=} ignore
 * @property {(function(fPath: string): boolean)=} keep
 */

/**
 *
 * @param {GHObj} ghObj
 * @param {string} repo
 * @param {string} [message = 'Generating template']
 * @param {Array<Dir>=} dirs
 * @param {Object=} plain
 * @return {Promise<void>}
 */
async function uploadFiles(ghObj, repo, {
  message = 'Generating template', dirs, plain
}) {
  const toCreate = [];
  if (dirs) {
    for (const { dir, keep, ignore, place } of dirs) {
      const allFilePaths = await getFilesRecursively(dir);
      const filePaths = allFilePaths.filter(fPath => (!keep || keep(fPath)) && (!ignore || !ignore(path)));

      for (const filePath of filePaths) {
        const content = await fs.promises.readFile(filePath, 'base64');
        const relativePath = path.relative(dir, filePath);
        const pathWithPlace = place ? path.join(place, relativePath) : relativePath;
        toCreate.push({ path: pathWithPlace.replace(/\\/g, '/'), content });
      }
    }
  }

  if (plain) {
    toCreate.push(...unpack(plain));
  }

  for (const fileData of toCreate) {
    await ghObj.octokit.rest.repos.createOrUpdateFileContents({
      owner: ghObj.user.name, repo, ...fileData, message
    });
  }
}

module.exports = {
  getOctokit, uploadFiles
}
