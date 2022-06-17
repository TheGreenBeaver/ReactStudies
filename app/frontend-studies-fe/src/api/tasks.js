import EndpointService from './EndpointService';


class TasksService extends EndpointService {
  constructor() {
    super('/tasks');
  }
}

const tasksService = new TasksService();
export default tasksService;
export { TasksService };