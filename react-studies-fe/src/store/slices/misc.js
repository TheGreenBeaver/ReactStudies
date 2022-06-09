import { createSlice } from '@reduxjs/toolkit';

const miscSlice = createSlice({
  name: 'misc',
  initialState: {
    fatalError: null,
    urgentTokenModalOpen: false
  },
  reducers: {
    setFatalError: (state, action) => {
      state.fatalError = action.payload;
    },
    setUrgentTokenModalOpen: (state, action) => {
      state.urgentTokenModalOpen = action.payload;
    }
  }
});

const { setFatalError, setUrgentTokenModalOpen } = miscSlice.actions;
const clearFatalError = () => setFatalError(null);
export { setFatalError, clearFatalError, setUrgentTokenModalOpen };
export default miscSlice.reducer;