import usePromise from './usePromise';
import { useEffect } from 'react';


const defaultShouldFetch = (...deps) => !deps.some(param => !param);
const defaultGetData = result => result.data;

function useFetch(fn, {
  deps = [],
  shouldFetch = defaultShouldFetch,
  initialData = [],
  getData = defaultGetData,
  ...specialHandlers
} = {}) {
  const { data, isProcessing, error, handler } = usePromise(fn, {
    initialIsProcessing: shouldFetch(...deps), initialData, getData,
    ...specialHandlers
  });

  useEffect(() => {
    if (shouldFetch(...deps)) {
      handler(...deps);
    }
  }, deps);

  return [data, isProcessing, error];
}

export default useFetch;