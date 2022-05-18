import { AppLink, RouteConfig } from '../config-classes';
import TasksList from './tasks-list';
import AddTask from './add-task';
import SingleTask from './single-task';


const links = {
  list: new AppLink('/tasks'),
  add: new AppLink('/tasks/add'),
  single: new AppLink('/tasks/:id(\\d+)')
};

const routes = [
  new RouteConfig(links.list, TasksList, {
    isAuthorized: true,
    isVerified: true
  }),
  new RouteConfig(links.add, AddTask, {
    isAuthorized: true,
    isVerified: true,
    isTeacher: true
  }),
  new RouteConfig(links.single, SingleTask,{
    isAuthorized: true,
    isVerified: true,
  })
];

export { links, routes }