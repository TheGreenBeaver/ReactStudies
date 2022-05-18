import { AppLink, RouteConfig } from '../config-classes';
import SolutionsList from './solutions-list';
import SingleSolution from './single-solution';
import AddSolution from './add-solution';

const links = {
  list: new AppLink('/solutions'),
  single: new AppLink('/solutions/:id(\\d+)'),
  add: new AppLink('/solutions/add')
};

const routes = [
  new RouteConfig(links.list, SolutionsList, {
    isVerified: true,
    isAuthorized: true
  }),
  new RouteConfig(links.single, SingleSolution, {
    isAuthorized: true,
    isVerified: true
  }),
  new RouteConfig(links.add, AddSolution, {
    isAuthorized: true,
    isVerified: true,
    isTeacher: false
  })
];

export { links, routes };