import { useEffect, useRef } from 'react';


function useScrollToNewInput(values, offset = 16) {
  const causedByDeletionRef = useRef(false);
  const newInputRef = useRef(null);
  const inputsWrapperRef = useRef(null);

  function onDelete() {
    causedByDeletionRef.current = true;
  }

  useEffect(() => {
    if (!Array.isArray(values)) {
      return;
    }
    if (causedByDeletionRef.current) {
      causedByDeletionRef.current = false;
      return;
    }
    const newInput = newInputRef.current;
    const inputsWrapper = inputsWrapperRef.current;
    if (newInput && inputsWrapper) {
      const inputsWrapperLeft = inputsWrapper.getBoundingClientRect().left;
      const newInputLeft = newInput.getBoundingClientRect().left;
      inputsWrapper.scrollTo({
        top: 0,
        left: newInputLeft - inputsWrapperLeft + offset,
        behavior: 'smooth'
      });
      newInput.focus();
    }
  }, [values?.length]);

  return { newInputRef, inputsWrapperRef, onDelete };
}

export default useScrollToNewInput;