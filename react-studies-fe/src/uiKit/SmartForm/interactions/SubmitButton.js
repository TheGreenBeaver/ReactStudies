import React from 'react';
import Button from '@mui/material/Button';
import { bool, node, object } from 'prop-types';
import { useFormikContext } from 'formik';
import Preloader from '../../Preloader';


function SubmitButton({ children, sx, disabled, ...props }) {
  const { isSubmitting } = useFormikContext();

  return (
    <Button
      disabled={disabled || isSubmitting}
      variant='contained'
      sx={{ display: 'flex', columnGap: 1, ...sx }}
      {...props}
    >
      {isSubmitting && <Preloader size='1em' />}
      {children}
    </Button>
  );
}

SubmitButton.propTypes = {
  children: node,
  sx: object,
  disabled: bool
};

export default SubmitButton;