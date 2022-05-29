import { useEffect, useRef, useState, useMemo } from 'react';
import throttle from 'lodash/throttle';


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
  const tracker = useMemo(() => throttle(trackOverflow, 300), []);

  useEffect(() => {
    window.addEventListener('resize', tracker);
    return () => window.removeEventListener('resize', tracker);
  }, [elRef]);

  const mb = isOverflowing ? -2 : 0;
  return [mb, tracker, elRef, isOverflowing];
}

export default useScrollbarCompensation;