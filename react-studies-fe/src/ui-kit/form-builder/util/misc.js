const NON_FIELD_ERRORS = 'nonFieldErrors';

function getAcceptPattern(acceptToken) {
  return new RegExp(acceptToken.replace('*', '[a-zA-Z-]+'));
}

function mimeFits(mime, accept) {
  return accept.split(',').some(token => getAcceptPattern(token).test(mime));
}

export { NON_FIELD_ERRORS, mimeFits };