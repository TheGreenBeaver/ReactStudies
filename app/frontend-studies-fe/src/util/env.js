const ENVS = {
  dev: 'development',
  prod: 'production',
};

function getVar(name, defaultVal = '') {
  return process.env[name] || defaultVal;
}

function getEnv() {
  return getVar('NODE_ENV', ENVS.dev).toLowerCase();
}

const isDev = getEnv() === ENVS.dev;

export { getVar, getEnv, isDev };