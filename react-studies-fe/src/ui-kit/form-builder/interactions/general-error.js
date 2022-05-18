import React from 'react';
import { useField } from 'formik';
import FormHelperText from '@mui/material/FormHelperText';
import { NON_FIELD_ERRORS } from '../util/misc';


function GeneralError(props) {
  const [, meta] = useField(NON_FIELD_ERRORS);

  return (
    <FormHelperText error {...props}>
      {meta.error}
    </FormHelperText>
  );
}

export default GeneralError;