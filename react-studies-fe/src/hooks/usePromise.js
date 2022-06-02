import { useCallback } from 'react';
import useMountedState from './useMountedState';


const defaultGetData = result => result;

function usePromise(fn, {
  initialIsProcessing = false,
  initialData = null,
  getData = defaultGetData,
  onSuccess,
  onError,
  onAny
} = {}) {
  const [isProcessing, setIsProcessing] = useMountedState(initialIsProcessing);
  const [error, setError] = useMountedState(null);
  const [data, setData] = useMountedState(initialData)

  const handler = useCallback(async (...args) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await fn(...args);
      let cleanResult;
      setData(curr => {
        cleanResult = getData(result, curr);
        return cleanResult;
      });
      onSuccess?.(cleanResult);
    } catch (e) {
      setError(e);
      onError?.(e);
    } finally {
      setIsProcessing(false);
      onAny?.();
    }
  }, [fn, getData, onSuccess, onError, onAny]);

  return { handler, data, error, isProcessing };
}

export default usePromise;