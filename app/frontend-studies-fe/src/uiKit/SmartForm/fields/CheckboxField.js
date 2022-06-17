import React from 'react';
import { string, node } from 'prop-types';
import { useField, useFormikContext } from 'formik';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


function CheckboxField({ name, label }) {
  const [{ onChange, checked }] = useField(name);
  const { isSubmitting } = useFormikContext();

  return (
    <FormControlLabel
      disabled={isSubmitting}
      control={<Checkbox checked={checked} onChange={onChange} />}
      label={label}
      name={name}
    />
  );
}

CheckboxField.propTypes = {
  name: string.isRequired,
  label: node.isRequired
};

export default CheckboxField;