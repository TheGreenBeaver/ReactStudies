import { useMemo } from 'react';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle'


const options = { throttle, debounce };

/**
 *
 * @param {function} fn
 * @param {'debounce'|'throttle'} [deferrer = 'debounce']
 * @param {number} [timeout = 1000]
 * @param {*[]} deps
 * @return {function(...[*]): *}
 */
function useDeferredFunction(fn, deferrer = 'debounce', timeout = 1000, deps = []) {
  const debouncedFn = useMemo(() => options[deferrer](fn, timeout), deps);

  return (...args) => {
    debouncedFn.cancel();
    return debouncedFn(...args);
  };
}

export default useDeferredFunction;