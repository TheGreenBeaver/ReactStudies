import { account } from '../actions/action-types';
import { clearCredentials, getIsAuthorized, saveCredentials } from '../../util/auth';


const initialState = {
  userData: undefined,
  isAuthorized: getIsAuthorized()
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case account.UPDATE_USER_DATA:
      return { ...state, userData: { ...state.userData, ...action.userData } };
    case account.SIGN_IN:
      const { token } = action;
      saveCredentials(token);
      return { ...state, isAuthorized: true };
    case account.LOG_OUT:
      clearCredentials();
      return { userData: undefined, isAuthorized: false };
    default:
      return state;
  }
}

export default reducer;