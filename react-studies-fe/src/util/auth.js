const TOKEN_KEY = 'fsAuthToken';

function getCredentials() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveCredentials(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearCredentials() {
  localStorage.removeItem(TOKEN_KEY);
}

function getIsAuthorized() {
  return !!getCredentials();
}

export { getCredentials, saveCredentials, clearCredentials, getIsAuthorized };