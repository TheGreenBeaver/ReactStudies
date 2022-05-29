import AppLink from '../config/AppLink';

const links = {
  resetPassword: new AppLink('/reset_password'),
  verify: new AppLink('/confirm/verify/:uid/:token'),
  notVerified: new AppLink('/not_verified'),
  signIn: new AppLink('/sign_in'),
  signUp: new AppLink('/sign_up'),
};

export default links;
