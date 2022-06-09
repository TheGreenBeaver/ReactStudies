import ReactSymbol from '../assets/icons/ReactSymbol';
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
  [TASK_KINDS.react]: <ReactSymbol />,
  [TASK_KINDS.layout]: <Html />
};

const ELEMENT_RULE_KINDS = {
  absPos: 'abs_pos',
  rawSizing: 'raw_sizing',
  mustUse: 'must_use'
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
const TOKEN_INFO = 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token';

const DEFAULT_PAGINATED_DATA = { results: [], next: null, prev: null, count: 0 };
const DEFAULT_PAGE_SIZE = 30;
const STANDARD_RATIO = { w: 16, h: 9 };
const COLOUR_MODES = {
  dark: 'dark',
  light: 'light'
};

const SUMMARY_OPTIONS = {
  bad: 'bad',
  medium: 'medium',
  good: 'good',
};
const SUMMARY_INDICATOR_COLOURS = {
  [SUMMARY_OPTIONS.good]: 'success',
  [SUMMARY_OPTIONS.bad]: 'error',
  [SUMMARY_OPTIONS.medium]: 'warning'
};

export {
  NON_FIELD_ERR, GITHUB_ERR,
  SIZE_UNITS, FILE_TRIBES,
  TASK_KINDS, TASK_KIND_DEFINITIONS, TASK_KIND_ICONS,
  ELEMENT_RULE_KINDS,
  ELEMENT_FIELDS, ELEMENT_FIELDS_EMPTY, CAVEAT_FIELDS,
  TOKEN_FIELDS, TOKEN_INFO,
  STANDARD_RATIO, COLOUR_MODES, DEFAULT_PAGE_SIZE, DEFAULT_PAGINATED_DATA,
  SUMMARY_OPTIONS, SUMMARY_INDICATOR_COLOURS
};