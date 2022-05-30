import usersService from './users';
import authService from './auth';
import tasksService from './tasks';


class Api {
  constructor() {
    this.users = usersService;
    this.auth = authService;
    this.tasks = tasksService;
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