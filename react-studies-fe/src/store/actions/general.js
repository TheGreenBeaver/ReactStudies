import { general } from './action-types';


const setError = err => ({
  type: general.SET_ERROR,
  err
});

const clearError = () => setError(null);

export { setError, clearError, };