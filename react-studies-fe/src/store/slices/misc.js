import { createSlice } from '@reduxjs/toolkit';

const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    fatalError: null,
  },
  reducers: {
    setFatalError: (state, action) => {
      state.fatalError = action.payload;
    },
  }
});

const { setFatalError } = miscSlice.actions;
const clearFatalError = () => setFatalError(null);
export { setFatalError, clearFatalError };
export default miscSlice.reducer;