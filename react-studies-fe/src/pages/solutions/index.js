import SolutionsList from './SolutionsList';
import SingleSolution from './SingleSolution';
import AppRoute from '../config/AppRoute';
import links from './links';

const routes = [
  new AppRoute(links.solutionsList, SolutionsList,{
    isAuthorized: true, isVerified: true, isTeacher: false
  }),
  new AppRoute(links.singleSolution, SingleSolution, {
    isAuthorized: true, isVerified: true
  }),
];

export default routes;
