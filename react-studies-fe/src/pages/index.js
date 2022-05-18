import tasksRoutes from './tasks';
import authRoutes from './auth';
import { Switch, Route } from 'react-router-dom';

const routes = [
  ...tasksRoutes,
  ...authRoutes,
];
function Routing() {
  return (
    <Switch>
      {routes.map((appRoute) => <Route key={appRoute.component.name} {...appRoute} />)}
    </Switch>
  );
}

export default Routing;
