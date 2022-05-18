import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { CenterBox } from '../ui-kit/layout';


function Loading() {
  return (
    <CenterBox height='100vh' width='100vw'>
      <CircularProgress size={100} thickness={5} />
    </CenterBox>
  );
}

export default Loading;