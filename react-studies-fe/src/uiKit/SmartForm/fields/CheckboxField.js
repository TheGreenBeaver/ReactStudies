import React from 'react';
import { string } from 'prop-types';
import { useField } from 'formik';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


function CheckboxField({ name, label }) {
  const [{ onChange, checked }] = useField(name);

  return (
    <FormControlLabel
      control={<Checkbox checked={checked} onChange={onChange} />}
      label={label}
      name={name}
    />
  );
}

CheckboxField.propTypes = {
  name: string.isRequired,
  label: string.isRequired
};

export default CheckboxField;