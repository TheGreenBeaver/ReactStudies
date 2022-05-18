function getUpd(upd, curr) {
  return typeof upd === 'function' ? upd(curr) : upd;
}

export { getUpd }