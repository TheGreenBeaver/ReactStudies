import AppLink from '../config/AppLink';

const links = {
  singleTask: new AppLink('/tasks/:id(\\d+)'),
  createTask: new AppLink('/tasks/create'),
  taskList: new AppLink('/tasks'),
};

export default links;
