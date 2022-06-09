import { createSlice } from '@reduxjs/toolkit';
import { clearCredentials, getIsAuthorized, saveCredentials } from '../../util/auth';
import api from '../../api';


const accountSlice = createSlice({
  name: 'account',
  initialState: {
    userData: undefined,
    isAuthorized: getIsAuthorized()
  },
  reducers: {
    updateUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    newAwaitingSolution: (state, action) => {
      state.userData.solutions.push(action.payload);
    },
    signIn: (state, action) => {
      saveCredentials(action.payload);
      api.authorizeAll(action.payload);
      state.isAuthorized = true;
    },
    logOut: () => {
      clearCredentials();
      return { userData: undefined, isAuthorized: false };
    }
  }
});

export const { updateUserData, logOut, signIn, newAwaitingSolution } = accountSlice.actions;
export default accountSlice.reducer;