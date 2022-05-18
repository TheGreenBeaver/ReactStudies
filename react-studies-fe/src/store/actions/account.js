import { account } from './action-types';


const signIn = token => ({
  type: account.SIGN_IN,
  token
});

const logOut = () => ({
  type: account.LOG_OUT
});

const updateUserData = userData => ({
  type: account.UPDATE_USER_DATA,
  userData
});

const setIsVerified = isVerified => updateUserData({ isVerified });

export {
  signIn,
  logOut,
  updateUserData,
  setIsVerified
};