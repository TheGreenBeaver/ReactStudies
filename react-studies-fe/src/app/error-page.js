import React from 'react';
import { number } from 'prop-types';
import { CenterBox } from '../ui-kit/layout';
import Typography from '@mui/material/Typography';


function ErrorPage({ status }) {
  return (
    <CenterBox height='100vh' width='100vw'>
      <Typography variant='h1'>
        Error {status}
      </Typography>
    </CenterBox>
  );
}

ErrorPage.propTypes = {
  status: number.isRequired
};

export default ErrorPage;