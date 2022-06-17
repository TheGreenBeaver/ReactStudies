import { useRef, useState } from 'react';


function usePopover() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  function openMenu() {
    setOpen(true);
  }

  return {
    triggerProps: { ref: anchorRef, onClick: openMenu },
    popoverProps: {
      anchorEl: anchorRef.current,
      open: !!anchorRef.current && open,
      onClose: closeMenu
    },
    closeMenu
  };
}

export default usePopover;