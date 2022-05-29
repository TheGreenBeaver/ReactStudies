import React from 'react';
import { number, oneOfType, string } from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';


function Preloader({ size }) {
  // TODO: Preloader
  return <CircularProgress size={size} />;
}

Preloader.propTypes = {
  size: oneOfType([number, string]).isRequired,
};

export default Preloader;