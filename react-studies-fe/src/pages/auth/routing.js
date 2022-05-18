import { AppLink, RouteConfig } from '../config-classes';
import SignIn from './sign-in';
import SignUp from './sign-up';
import Verify from './verify';

const links = {
  signIn: new AppLink('/sign_in'),
  signUp: new AppLink('/sign_up'),
  verify: new AppLink('/confirm/verify/:uid/:token'),
  notVerified: new AppLink('/not_verified'),
  resetPassword: new AppLink('/reset_password')
};

const routes = [
  new RouteConfig(links.signIn, SignIn, {
    isAuthorized: false,
    narrow: true
  }),
  new RouteConfig(links.signUp, SignUp, {
    isAuthorized: false,
    narrow: true
  }),
  new RouteConfig(links.verify, Verify, {
    isVerified: false,
  }),
  new RouteConfig(links.notVerified, () => 'Not Verified', {
    isVerified: false,
    isAuthorized: true
  }),
  new RouteConfig(links.resetPassword, () => 'Reset Password', {
    isAuthorized: false,
    narrow: true
  })
];

export { links, routes };