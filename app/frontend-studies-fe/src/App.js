import Routing from './pages';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useUserState } from './store/selectors';
import { logOut, newAwaitingSolution, updateUserData } from './store/slices/account';
import LoadingPage from './components/LoadingPage';
import Wrappers from './wrappers';
import Contexts from './contexts';
import api from './api';
import httpStatus from 'http-status';
import { setFatalError, setUrgentTokenModalOpen } from './store/slices/misc';
import { GITHUB_ERR, SUMMARY_INDICATOR_COLOURS } from './util/constants';
import Header from './components/Header';
import ws from './ws';
import useWsAction from './hooks/useWsAction';
import WsWithQueue from './ws/ws-with-queue';
import useAlert from './hooks/useAlert';
import UrgentTokenModal from './components/UrgentTokenModal';


function AppContent() {
  const dispatch = useDispatch();
  const userState = useUserState();
  const showAlert = useAlert();

  useEffect(() => () => ws.close(), []);

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
      ws.authorize();
      fetchSelfData();
    } else {
      api.unAuthorizeAll();
    }
  }, [userState.isAuthorized]);

  useWsAction(WsWithQueue.Actions.taskRepositoryPopulated, ({ title }) =>
    showAlert(`Repository for task ${title} is ready!`, 'success')
  );

  useWsAction(WsWithQueue.Actions.solutionRepositoryPopulated, () =>
    showAlert('Repository for your solution is ready!', 'success')
  );

  useWsAction(WsWithQueue.Actions.workflowCompleted, solution =>
    dispatch(newAwaitingSolution(solution))
  );

  useWsAction(WsWithQueue.Actions.workflowResultsReady, ({ result: { summary } }) =>
    showAlert(`Results for solution ready, summary: ${summary}`, SUMMARY_INDICATOR_COLOURS[summary])
  );

  useEffect(() => {
    if (userState.hasUnprocessedSolutions) {
      dispatch(setUrgentTokenModalOpen(true));
    }
  }, [userState.hasUnprocessedSolutions])

  if (userState.isAuthorized && !userState.isFetched) {
    return <LoadingPage fullScreen />;
  }

  return (
    <>
      <Header />
      {userState.isAuthorized && <UrgentTokenModal />}
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