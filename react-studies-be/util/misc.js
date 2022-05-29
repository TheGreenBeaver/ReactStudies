const path = require('path');
const fs = require('fs');
const { isDev, origin } = require('./env');
const http = require('http');
const { MEDIA_DIR, MEDIA_PATH } = require('../settings');


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

async function getPublicUrl() {
  if (!isDev) {
    return origin;
  }

  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 4040, path: '/api/tunnels', method: 'GET' }, res => {
      const chunks = [];

      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const jsonData = JSON.parse(chunks.join(''));
        resolve(jsonData.tunnels[0]?.public_url);
      });
    });
    req.on('error', err => reject(err));
    req.end();
  });
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

module.exports = {
  listUsableFiles,
  baseNoExt,
  isAsync,
  asyncMap,
  getFilesRecursively,
  getPublicUrl,
  composeMediaPath
};
