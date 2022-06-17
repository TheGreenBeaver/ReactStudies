import ResetPassword from './ResetPassword';
import Verify from './Verify';
import NotVerified from './NotVerified';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AppRoute from '../config/AppRoute';
import links from './links';

const routes = [
  new AppRoute(links.resetPassword, ResetPassword, { isAuthorized: false }),
  new AppRoute(links.verify, Verify),
  new AppRoute(links.notVerified, NotVerified, { isAuthorized: true, isVerified: false }),
  new AppRoute(links.signIn, SignIn, { isAuthorized: false, narrow: true }),
  new AppRoute(links.signUp, SignUp, { isAuthorized: false, narrow: true }),
];

export default routes;
