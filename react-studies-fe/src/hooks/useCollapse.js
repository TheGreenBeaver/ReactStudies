import { useEffect, useState } from 'react';


function useCollapse(onAfterClose, indicator, {
  initialIsOpen = false,
  shouldOpen = currentIndicator => !!currentIndicator
} = {}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  useEffect(() => {
    if (shouldOpen(indicator)) {
      setIsOpen(true);
    }
  }, [indicator]);

  function closeCollapse() {
    setIsOpen(false);
  }

  return [{ in: isOpen, unmountOnExit: true, onExited: onAfterClose }, closeCollapse];
}

export default useCollapse;