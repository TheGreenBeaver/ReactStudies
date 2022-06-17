import { useEffect } from 'react';
import ws from '../ws';


function useWsAction(actionName, handler, deps = []) {
  useEffect(() => {
    const unsubscribe = ws.subscribe(actionName, handler);

    return () => unsubscribe();
  }, deps)
}

export default useWsAction;