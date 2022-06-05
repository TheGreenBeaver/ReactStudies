import Routing from './pages';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUserState } from './store/selectors';
import { logOut, updateUserData } from './store/slices/account';
import LoadingPage from './components/LoadingPage';
import Wrappers from './wrappers';
import Contexts from './contexts';
import api from './api';
import httpStatus from 'http-status';
import { setFatalError } from './store/slices/misc';
import { GITHUB_ERR } from './util/constants';
import Header from './components/Header';


function AppContent() {
  const dispatch = useDispatch();
  const userState = useUserState();

  useEffect(() => {
    api.addErrorhandlerForAll(error => {
      const { data, status } = error.response;

      if (data?.[GITHUB_ERR]) {
        return Promise.reject(error);
      }

      if (httpStatus[`${status}_CLASS`] === httpStatus.classes.SERVER_ERROR || status === httpStatus.NOT_FOUND) {
        dispatch(setFatalError(error));
        return Promise.resolve({});
      }

      if (status === httpStatus.UNAUTHORIZED) {
        dispatch(logOut());
        return Promise.resolve({});
      }

      return Promise.reject(error);
    });
  }, []);

  useEffect(() => {
    const fetchSelfData = async () => {
      const { data } = await api.users.me();
      dispatch(updateUserData(data));
    };

    if (userState.isAuthorized) {
      fetchSelfData();
    }
  }, [userState.isAuthorized]);

  if (userState.isAuthorized && !userState.isFetched) {
    return <LoadingPage fullScreen />;
  }

  return (
    <>
      <Header />
      <Routing />
    </>
  );
}

function App() {
  return (
    <Contexts>
      <Wrappers>
        <AppContent />
      </Wrappers>
    </Contexts>
  );
}

export default App;