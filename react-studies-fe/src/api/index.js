import usersService from './users';
import authService from './auth';
import tasksService from './tasks';
import solutionsService from './solutions';
import solutionResultsService from './solutionResults';


class Api {
  constructor() {
    this.users = usersService;
    this.auth = authService;
    this.tasks = tasksService;
    this.solutions = solutionsService;
    this.solutionResults = solutionResultsService;
  }

  allServices(action) {
    Object.values(this).forEach(action);
  }

  authorizeAll(token) {
    this.allServices(service => service.authorize(token));
  }

  unAuthorizeAll() {
    this.allServices(service => service.unAuthorize());
  }

  addErrorhandlerForAll(handler) {
    this.allServices(service => service.addErrorHandler(handler));
  }
}

const api = new Api();
export default api;
export { Api };