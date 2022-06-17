import { configureStore } from '@reduxjs/toolkit';
import account from './slices/account';
import misc from './slices/misc';


const store = configureStore({
  reducer: { account, misc },
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: false
  })
});

export default store;