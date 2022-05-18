import withPageContainer from './with-page-container';


class AppLink {
  /**
   *
   * @param {string} path - path to be used for the corresponding Route
   */
  constructor(path) {
    this.path = path;
  }

  get(...params) {
    const pathParts = this.path.split(/(?<!\\)\//);
    let paramIdx = 0;
    return pathParts.map(part => part.startsWith(':') ? params[paramIdx++] : part).join('/');
  }
}

class RouteConfig {
  static ANY = 'any';
  configFields = ['isAuthorized', 'isVerified', 'isTeacher'];

  constructor(appLink, component, {
    isAuthorized = RouteConfig.ANY,
    isVerified = RouteConfig.ANY,
    isTeacher = RouteConfig.ANY,
    exact = true,
    narrow = false
  } = {}) {
    this.path = appLink instanceof AppLink ? appLink.path : appLink;
    this.component = withPageContainer(component, narrow);
    this.exact = exact;
    this.isAuthorized = isAuthorized;
    this.isVerified = isVerified;
    this.isTeacher = isTeacher;
  }

  fits(userState) {
    return this.configFields.every(stateField =>
      [userState[stateField], RouteConfig.ANY].includes(this[stateField])
    );
  }
}

export { AppLink, RouteConfig };