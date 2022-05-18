import { general, account } from '../actions/action-types';

const initialState = {
  err: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case general.SET_ERROR:
      return { ...state, err: action.err };
    case account.LOG_OUT:
      return initialState;
    default:
      return state;
  }
}

export default reducer;