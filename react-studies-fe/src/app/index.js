import Routing from '../pages/routing';
import { useErr, useUserState } from '../store/selectors';
import { useEffect, useState } from 'react';
import usersService from '../api/users';
import { useDispatch } from 'react-redux';
import { logOut, updateUserData } from '../store/actions/account';
import ErrorPage from './error-page';
import Loading from './loading';
import Header from '../components/header';

function App() {
  const dispatch = useDispatch();

  const userState = useUserState();
  const err = useErr();

  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSelfData = async () => {
      setIsFetching(true);
      try {
        const response = await usersService.me();
        dispatch(updateUserData(response.data));
      } catch (e) {
        dispatch(logOut());
      } finally {
        setIsFetching(false);
      }
    }

    if (userState.isAuthorized) {
      fetchSelfData();
    }
  }, [userState.isAuthorized]);

  if (err) {
    return <ErrorPage status={err.status} />;
  }

  if (isFetching && userState.isAuthorized && !userState.isFetched) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <Routing />
    </>
  );
}

export default App;
