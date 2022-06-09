import { useEffect, useRef } from 'react';
import useDeferredFunction from './useDeferredFunction';


function useInfiniteScroll(loadMore, shouldLoad, { threshold = 100, initialLoad = false } = {}) {
  const scrollBoxRef = useRef(null);
  const pageRef = useRef(1);
  const initialLoadDone = useRef(false);

  function scrollHandler() {
    const scrollBox = scrollBoxRef.current;
    if (!scrollBox || !shouldLoad) {
      return;
    }
    const { scrollHeight, scrollTop, clientHeight } = scrollBox;
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      loadMore(++pageRef.current);
    }
  }

  useEffect(() => {
    if (initialLoad && !initialLoadDone.current) {
      loadMore(pageRef.current++);
      initialLoadDone.current = true;
    }
  }, [initialLoad]);

  const onScroll = useDeferredFunction(scrollHandler, 'throttle', 300, [shouldLoad, loadMore]);

  function resetPage() {
    pageRef.current = 1;
  }

  return [{ ref: scrollBoxRef, onScroll }, resetPage];
}

export default useInfiniteScroll;