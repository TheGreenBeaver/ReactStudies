import { SIZE_UNITS, FILE_TRIBES, DEFAULT_PAGE_SIZE, TASK_KINDS } from './constants';
import pick from 'lodash/pick';


function getUpd(upd, curr) {
  return typeof upd === 'function' ? upd(curr) : upd;
}

function blockEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}

const unitsPower = Object.values(SIZE_UNITS);
const bytesPerPower = 1024;

function humanizeFileSize(sizeInBytes) {
  let unitIdx = 0;
  let val = sizeInBytes;
  while (val >= bytesPerPower && unitIdx < unitsPower.length) {
    val /= bytesPerPower;
    unitIdx++;
  }
  return `${val.toFixed(2)} ${unitsPower[unitIdx]}`;
}

function serializeFileSize(sizeInUnits, unit) {
  const power = unitsPower.indexOf(unit);
  return sizeInUnits * Math.pow(bytesPerPower, power);
}

function getTribeFromMime(mime) {
  const [family, def] = mime.split('/');
  if (family in FILE_TRIBES) {
    return family;
  }
  if (
    ['text/plain', 'text/richtext', 'application/msword', 'application/pdf'].includes(mime) ||
    /officedocument|opendocument|vnd\.sun\.xml/.test(def)) {
    return FILE_TRIBES.doc;
  }
  if (family === 'font' || /zip|archive|font|(x-\w*tar)/.test(def)) {
    return FILE_TRIBES.pack;
  }
  if (mime.startsWith('text/x-') || /script|html|css|java/.test(def)) {
    return FILE_TRIBES.snippet;
  }
  return FILE_TRIBES.unknown;
}

function combineRefs(...refs) {
  return instance => refs.forEach(ref => {
    if (ref) {
      ref.current = instance;
    }
  });
}

function isPositiveInt(param) {
  return Number.isInteger(param) && param > 0;
}

function getOptions(enumObj, nullLabel) {
  const options = Object.entries(enumObj).map(([value, label]) => ({ value, label }));
  if (nullLabel) {
    options.unshift({ label: nullLabel, value: '' });
  }
  return options;
}

function cleanupPaginationParams(params) {
  const cleanParams = pick(params, ['page', 'pageSize']);
  if (!isPositiveInt(cleanParams.page)) {
    cleanParams.page = 1;
  }
  if (!isPositiveInt(cleanParams.pageSize)) {
    cleanParams.pageSize = DEFAULT_PAGE_SIZE;
  }
  return cleanParams;
}

function cleanupTaskKindParams(params) {
  const cleanParams = pick(params, 'kind');
  if (!(cleanParams.kind in TASK_KINDS)) {
    delete cleanParams.kind;
  }
  return cleanParams;
}

export {
  getUpd,
  blockEvent,
  humanizeFileSize,
  serializeFileSize,
  getTribeFromMime,
  combineRefs,
  cleanupPaginationParams,
  cleanupTaskKindParams,
  isPositiveInt,
  getOptions
};