import React, { forwardRef } from 'react';
import { node } from 'prop-types';
import Box from '@mui/material/Box';


function CenterBoxComponent({ children, ...otherProps }, ref) {
  const props = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...otherProps
  };
  return (
    <Box {...props} ref={ref}>
      {children}
    </Box>
  );
}

const CenterBox = forwardRef(CenterBoxComponent);

CenterBox.propTypes = {
  children: node
};

export default CenterBox;