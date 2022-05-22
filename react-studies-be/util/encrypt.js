const crypto = require('crypto');
const { getVar } = require('./env');
const { now } = require('lodash');
const { EXPIRATION_TIME } = require('../settings');


function generateRandomString(size) {
  return crypto.randomBytes(size).toString('hex');
}

function hash(value) {
  const hmac = crypto.createHmac('sha256', getVar('SECRET_KEY'), { encoding: 'utf8' });
  hmac.update(value);
  return hmac.digest('hex');
}

function compareHashed(plain, hashed) {
  return hash(plain) === hashed;
}

function getB36(value) {
  return value.toString(36);
}

function parseB36(value) {
  return parseInt(value, 36);
}

function generateToken(seedObj, usedFields, timestamp) {
  const toHash = usedFields.map(field => seedObj[field]).join('');
  const hashedVal = hash(toHash);

  const b36 = getB36(timestamp || now());
  return `${b36}-${hashedVal}`;
}

const TOKEN_STATUS = {
  INVALID: 'INVALID',
  EXPIRED: 'EXPIRED',
  OK: 'OK'
};

function checkToken(seedObj, token, usedFields) {
  if (!seedObj) {
    return TOKEN_STATUS.INVALID;
  }

  const timestamp = parseB36(token.split('-')[0]);
  const regenerated = generateToken(seedObj, usedFields, timestamp);
  if (regenerated !== token) {
    return TOKEN_STATUS.INVALID;
  }

  if (now() - timestamp > EXPIRATION_TIME) {
    return TOKEN_STATUS.EXPIRED;
  }

  return TOKEN_STATUS.OK;
}

module.exports = {
  generateRandomString,
  hash,
  compareHashed,
  checkToken,
  generateToken,
  getB36,
  parseB36,
  TOKEN_STATUS
};
