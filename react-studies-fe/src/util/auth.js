const TOKEN = 'token';

function getCookie(name) {
  return document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith(`${name}=`))
    ?.split('=')[1];
}

function setCookie(name, value, maxAge = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; secure; samesite=strict`;
}

function deleteCookie(name) {
  setCookie(name, `Token ${getCredentials()}`, -1);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getCredentials() {
  return getCookie(TOKEN);
}

function saveCredentials(token) {
  setCookie(TOKEN, `Token ${token}`);
}

function clearCredentials() {
  deleteCookie(TOKEN);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getIsAuthorized() {
  return !!getCredentials();
}

function getAuthHeaders(headers = {}) {
  return { ...headers, Authorization: getCredentials() };
}

export {
  saveCredentials,
  clearCredentials,
  getCredentials,
  getAuthHeaders,
  getIsAuthorized
};