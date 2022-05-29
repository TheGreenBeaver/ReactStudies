import { Redirect, useHistory } from 'react-router-dom';
import { useUserState } from '../../store/selectors';
import { getDefaultPath } from './links';
import AppLayout from './AppLayout';

const STORAGE_FIELD = Symbol();

function useReturnToApp() {
  const userState = useUserState()
  const history = useHistory();
  const { location: { state } } = history;

  function returnToApp() {
    const to = state?.[STORAGE_FIELD] || getDefaultPath(userState);
    history.replace(to);
  }

  return returnToApp;
}

function withAccessControl(Component, fits, layoutProps) {
  return props => {
    const history = useHistory();
    const userState = useUserState();
    const { location: { pathname, state } } = history;

    if (!fits(userState)) {
      const savedPath = state?.[STORAGE_FIELD];
      const to = {
        pathname: savedPath || getDefaultPath(userState),
        state: savedPath ? undefined : { [STORAGE_FIELD]: pathname }
      };
      return <Redirect to={to} />;
    }

    return (
      <AppLayout {...layoutProps}>
        <Component {...props} />
      </AppLayout>
    )
  };
}

export { useReturnToApp, withAccessControl };