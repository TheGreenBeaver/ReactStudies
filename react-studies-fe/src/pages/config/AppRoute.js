import { AppRoute as AppRouteBase, defaultConfig } from 'smart-react-routing';
import Layout from './Layout';
import { getDefaultPath } from './links';

class AppRoute extends AppRouteBase {
  static defaultConfig = {
    ...defaultConfig,
    StateDependentLayout: Layout,
    getDefaultPath,
  };
}

export default AppRoute;
