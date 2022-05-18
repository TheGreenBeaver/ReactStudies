import { combineReducers } from 'redux';
import account from './account';
import general from './general';


const rootReducer = combineReducers({
  account, general
});

export default rootReducer;