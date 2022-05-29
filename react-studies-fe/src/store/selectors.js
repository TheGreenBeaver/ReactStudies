import { useSelector } from 'react-redux';

function useUserState() {
  const { userData, isAuthorized } = useSelector(state => state.account);
  return {
    isAuthorized,
    isFetched: !!userData,
    isVerified: !!userData?.isVerified,
    isTeacher: !!userData?.isTeacher
  };
}

function useFatalError() {
  return useSelector(state => state.misc.fatalError);
}

export {
  useUserState, useFatalError
};