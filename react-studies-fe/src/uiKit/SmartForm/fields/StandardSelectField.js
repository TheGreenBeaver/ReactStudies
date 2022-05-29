import { string } from 'prop-types';
import { OptionListType } from '../../../util/types';
import { Field } from 'formik';
import MenuItem from '@mui/material/MenuItem';
import { Select } from 'formik-mui';
import startCase from 'lodash/startCase';


function StandardSelectField({ options, ...otherProps }) {
  const { formControl, ...selectProps } = otherProps;
  const props = {
    label: startCase(otherProps.name),
    formControl: { size: 'small', margin: 'normal', fullWidth: true, ...formControl },
    ...selectProps
  };
  return (
    <Field component={Select} {...props}>
      {options.map(({ value, label }) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
    </Field>
  );
}

StandardSelectField.propTypes = {
  name: string.isRequired,
  options: OptionListType.isRequired
};

export default StandardSelectField;