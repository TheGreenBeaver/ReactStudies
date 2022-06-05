const path = require('path');
const fs = require('fs');
const { origin } = require('./env');
const { MEDIA_DIR, MEDIA_PATH } = require('../settings');
const startCase = require('lodash/startCase');


function getFileIsUsable(file, basename) {
  return file.indexOf('.') !== 0 && file !== basename && path.extname(file) === '.js' && !file.startsWith('_');
}

/**
 *
 * @param {string} dirname
 * @param {string} filename
 * @return {string[]}
 */
function listUsableFiles(dirname, filename) {
  const basename = path.basename(filename);
  return fs
    .readdirSync(dirname)
    .filter(file => getFileIsUsable(file, basename))
}

function baseNoExt(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

function isAsync(fn) {
  return fn.constructor.name ==='AsyncFunction';
}

function asyncMap(arr, mapperFn) {
  return Promise.all(arr.map(mapperFn));
}

async function getFilesRecursively(dir) {
  const children = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(children.map(child => {
    const fullPath = path.resolve(dir, child.name);
    return child.isDirectory() ? getFilesRecursively(fullPath) : Promise.resolve(fullPath);
  }));
  return files.flat();
}

function composeMediaPath(file, baseDir = MEDIA_DIR, basePath = MEDIA_PATH) {
  if (!file) {
    return null;
  }

  if (file.startsWith('http')) {
    return file;
  }

  const purePath = path.relative(baseDir, file).replace(/\\/g, '/');
  return `${origin}${basePath}/${purePath}`;
}

function standardizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function pascalCase(str) {
  return startCase(str).replace(/ /g, '');
}

module.exports = {
  listUsableFiles,
  baseNoExt,
  isAsync,
  asyncMap,
  getFilesRecursively,
  composeMediaPath,
  standardizePath,
  pascalCase
};
