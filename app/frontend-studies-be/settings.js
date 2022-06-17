const path = require('path');

const API_PATH = '/api';
const WS_PATH = '/ws';
const WEBHOOKS_PATH = '/webhooks';
const MEDIA_PATH = '/media';

const FE_HOSTS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

const ROOT_DIR = __dirname;
const REPO_TEMPLATES_DIR = path.join(ROOT_DIR, 'repo-templates');
const MEDIA_DIR = path.join(ROOT_DIR, 'media');
const TEMP_DIR = path.join(ROOT_DIR, 'tmp-files');

const GITHUB_USER_AGENT = 'react-studies/v1.0.0'

const DEFAULT_PAGE_SIZE = 30;
const NON_FIELD_ERR = '_nonFieldErr';
const GITHUB_ERR = '_gitHubErr';

module.exports = {
  API_PATH,
  WS_PATH,
  WEBHOOKS_PATH,
  MEDIA_PATH,

  FE_HOSTS,

  ROOT_DIR,
  REPO_TEMPLATES_DIR,
  MEDIA_DIR,
  TEMP_DIR,

  GITHUB_USER_AGENT,

  DEFAULT_PAGE_SIZE,
  NON_FIELD_ERR,
  GITHUB_ERR
};
