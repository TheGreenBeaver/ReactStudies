import { stringify } from 'query-string';


class AppLink {
  constructor(path) {
    this.path = path;
  }

  compose(...params) {
    const pathParts = this.path.split(/(?<!\\)\//);
    let paramIdx = 0;
    const withPathParams = pathParts.map(part => part.startsWith(':') ? params[paramIdx++] : part).join('/');
    if (paramIdx >= params.length) {
      return withPathParams;
    }

    return `${withPathParams}/?${stringify(params[params.length - 1])}`;
  }
}

export default AppLink;