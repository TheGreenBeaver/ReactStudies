import ReactIcon from '../assets/icons/React';
import Html from '@mui/icons-material/Html';


const NON_FIELD_ERR = '_nonFieldErr';
const GITHUB_ERR = '_gitHubErr';

const SIZE_UNITS = { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB' };
const FILE_TRIBES = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  doc: 'doc',
  pack: 'pack',
  snippet: 'snippet',
  unknown: 'unknown',
};

const TASK_KINDS = {
  layout: 'layout',
  react: 'react',
};
const TASK_KIND_DEFINITIONS = {
  [TASK_KINDS.react]: 'React app',
  [TASK_KINDS.layout]: 'HTML layout'
};
const TASK_KIND_ICONS = {
  [TASK_KINDS.react]: ReactIcon,
  [TASK_KINDS.layout]: Html
};

const ELEMENT_FIELDS = {
  tag: 'tag',
  content: 'content',
};
const ELEMENT_FIELDS_EMPTY = {
  [ELEMENT_FIELDS.content]: [''],
  [ELEMENT_FIELDS.tag]: ''
};
const CAVEAT_FIELDS = {
  maxUsage: 'maxUsage',
  allowedFor: 'allowedFor',
};
const TOKEN_FIELDS = {
  gitHubToken: 'gitHubToken',
  rememberToken: 'rememberToken',
};

const DEFAULT_PAGINATED_DATA = { results: [], next: null, prev: null, count: 0 };
const DEFAULT_PAGE_SIZE = 30;
const STANDARD_RATIO = { w: 16, h: 9 };
const COLOUR_MODES = {
  dark: 'dark',
  light: 'light'
};

export {
  NON_FIELD_ERR, GITHUB_ERR,
  SIZE_UNITS, FILE_TRIBES,
  TASK_KINDS, TASK_KIND_DEFINITIONS, TASK_KIND_ICONS,
  ELEMENT_FIELDS, ELEMENT_FIELDS_EMPTY, CAVEAT_FIELDS, TOKEN_FIELDS,
  STANDARD_RATIO, COLOUR_MODES, DEFAULT_PAGE_SIZE, DEFAULT_PAGINATED_DATA
};