import AppLink from './AppLink';
import { withAccessControl } from './accessControl';


class AppRoute {
  static ANY = Symbol();

  constructor(appLink, component, {
    exact = true,
    isAuthorized = AppRoute.ANY,
    isVerified = AppRoute.ANY,
    isTeacher = AppRoute.ANY,
    narrow = false
  } = {}) {
    this.path = appLink instanceof AppLink ? appLink.path : appLink;
    this.exact = exact;
    this.component = withAccessControl(
      component,
      actualState => this.fits({ isAuthorized, isVerified, isTeacher }, actualState),
      { narrow },
    );
  }

  fits(requiredState, userState) {
    return Object.keys(requiredState).every(stateField =>
      [userState[stateField], AppRoute.ANY].includes(requiredState[stateField])
    );
  }
}

export default AppRoute;