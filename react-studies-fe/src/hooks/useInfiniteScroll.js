import { useRef } from 'react';
import useDeferredFunction from './useDeferredFunction';


function useInfiniteScroll(loadMore, shouldLoad, threshold = 100) {
  const scrollBoxRef = useRef(null);
  const pageRef = useRef(1);

  function scrollHandler() {
    const scrollBox = scrollBoxRef.current;
    if (!scrollBox || !shouldLoad) {
      return;
    }
    const { scrollHeight, scrollTop, clientHeight } = scrollBox;
    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      const nextPage = pageRef.current + 1;
      loadMore(nextPage);
      pageRef.current = nextPage;
    }
  }

  const onScroll = useDeferredFunction(scrollHandler, 'throttle', 300, [shouldLoad, loadMore]);

  function resetPage() {
    pageRef.current = 1;
  }

  return [{ ref: scrollBoxRef, onScroll }, resetPage];
}

export default useInfiniteScroll;