import ApiService from './index';

class TasksService extends ApiService {
  constructor() {
    super('/tasks');
  }
}

const tasksService = new TasksService();
export default tasksService;
export { TasksService };