import { useEffect, useRef, useState } from 'react';
import useDeferredFunction from './useDeferredFunction';


function useScrollbarCompensation() {
  const elRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  function trackOverflow() {
    const el = elRef.current;
    if (!el) {
      return;
    }
    const newIsOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    setIsOverflowing(newIsOverflowing);
  }
  const tracker = useDeferredFunction(trackOverflow, 'throttle', 300);

  useEffect(() => {
    window.addEventListener('resize', tracker);
    return () => window.removeEventListener('resize', tracker);
  }, [elRef]);

  const mb = isOverflowing ? -2 : 0;
  return [mb, tracker, elRef, isOverflowing];
}

export default useScrollbarCompensation;