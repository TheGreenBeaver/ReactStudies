import { Switch, Redirect, Route } from 'react-router-dom';
import { links as authLinks, routes as authRoutes } from './auth/routing';
import { links as solutionsLinks, routes as solutionsRoutes } from './solutions/routing';
import { links as tasksLinks, routes as tasksRoutes } from './tasks/routing';
import { useUserState } from '../store/selectors';
import { omit } from 'lodash';


const links = {
  auth: authLinks,
  solutions: solutionsLinks,
  tasks: tasksLinks
};

const routes = [
  ...authRoutes,
  ...solutionsRoutes,
  ...tasksRoutes
];

function getDefaultRoute({ isAuthorized, isVerified, isTeacher }) {
  if (!isAuthorized) {
    return links.auth.signIn.path;
  }

  if (isVerified) {
    return isTeacher ? links.solutions.list.path : links.tasks.list.path;
  }

  return links.auth.notVerified.path;
}

function Routing() {
  const userState = useUserState();
  return (
    <Switch>
      {
        routes
          .filter(r => r.fits(userState))
          .map((routeConfig) =>
            <Route
              key={routeConfig.component.name}
              {...omit(routeConfig, routeConfig.configFields)}
            />
          )
      }
      <Redirect to={getDefaultRoute(userState)} />
    </Switch>
  );
}

export { links };
export default Routing;