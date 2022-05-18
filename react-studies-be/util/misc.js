const path = require('path');


function getFileIsUsable(file, basename) {
  return file.indexOf('.') !== 0 && file !== basename && path.extname(file) === '.js' && !file.startsWith('_');
}

function baseNoExt(fileName) {
  return path.basename(fileName, path.extname(fileName));
}

module.exports = {
  getFileIsUsable,
  baseNoExt
};
