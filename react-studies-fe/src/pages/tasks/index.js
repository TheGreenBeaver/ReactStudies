import SingleTask from './SingleTask';
import CreateTask from './CreateTask';
import TaskList from './TaskList';
import AppRoute from '../config/AppRoute';
import links from './links';

const routes = [
  new AppRoute(links.singleTask, SingleTask, {
    isVerified: true,
    isAuthorized: true
  }),
  new AppRoute(links.createTask, CreateTask, {
    isVerified: true,
    isAuthorized: true,
    isTeacher: true
  }),
  new AppRoute(links.taskList, TaskList, {
    isVerified: true,
    isAuthorized: true
  }),
];

export default routes;
