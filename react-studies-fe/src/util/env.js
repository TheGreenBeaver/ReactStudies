const ENVS = {
  dev: 'dev',
  prod: 'prod',
};

function getVar(name, defaultVal = '') {
  return process.env[name] || defaultVal;
}

function getEnv() {
  return getVar('REACT_APP_ENV', ENVS.dev).toLowerCase();
}

function isDev() {
  return getEnv() === ENVS.dev;
}

export {
  getVar, getEnv, isDev
}