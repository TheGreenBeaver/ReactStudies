import solutionsRoutes from './solutions';
import tasksRoutes from './tasks';
import authRoutes from './auth';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useUserState } from '../store/selectors';
import { getDefaultPath } from './config/links';

const routes = [
  ...solutionsRoutes,
  ...tasksRoutes,
  ...authRoutes,
];

function Routing() {
  const userState = useUserState();
  return (
    <Switch>
      {routes.map((appRoute, idx) => <Route key={idx} {...appRoute} />)}
      <Redirect to={getDefaultPath(userState)} />
    </Switch>
  );
}

export default Routing;
