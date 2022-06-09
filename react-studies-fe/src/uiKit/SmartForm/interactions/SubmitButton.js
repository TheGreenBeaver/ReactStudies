import React from 'react';
import Button from '@mui/material/Button';
import { bool, node } from 'prop-types';
import { useFormikContext } from 'formik';
import Preloader from '../../Preloader';


function SubmitButton({ children, sx, disabled, startIcon, ...props }) {
  const { isSubmitting } = useFormikContext();

  return (
    <Button
      disabled={disabled || isSubmitting}
      variant='contained'
      startIcon={isSubmitting ? <Preloader size='1em' /> : startIcon}
      {...props}
    >
      {children}
    </Button>
  );
}

SubmitButton.propTypes = {
  children: node,
  disabled: bool,
  startIcon: node,
};

export default SubmitButton;