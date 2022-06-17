import { useState } from 'react';
import useIsMounted from './useIsMounted';


/**
 *
 * @template T
 * @param {T} initialState
 * @return {[T, Dispatch<SetStateAction<T>>]}
 */
function useMountedState(initialState) {
  const isMounted = useIsMounted();
  const [state, setState] = useState(initialState);

  function setStateIfMounted(upd) {
    if (isMounted.current) {
      setState(upd);
    }
  }

  return [state, setStateIfMounted];
}

export default useMountedState;