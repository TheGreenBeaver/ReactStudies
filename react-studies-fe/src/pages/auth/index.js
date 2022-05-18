import SignUp from './SignUp';
import SignIn from './SignIn';
import AppRoute from '../config/AppRoute';
import links from './links';

const routes = [
  new AppRoute(links.signUp, SignUp, { isAuthorized: false, isVerified: AppRoute.ANY, isTeacher: AppRoute.ANY }),
  new AppRoute(links.signIn, SignIn, { isAuthorized: false, isVerified: AppRoute.ANY, isTeacher: AppRoute.ANY }),
];

export default routes;
