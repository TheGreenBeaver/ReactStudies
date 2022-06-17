import React, { forwardRef } from 'react';
import { shape, string } from 'prop-types';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import useEditableView from '../../../hooks/useEditableView';
import startCase from 'lodash/startCase';
import kebabCase from 'lodash/kebabCase';


function SwitchingTextFieldComponent({ name, typographyProps, ...otherProps }, ref) {
  const { isEditing, values, getFieldMeta, getFieldProps, isSubmitting } = useEditableView();

  if (!isEditing) {
    return <Typography ref={ref} {...typographyProps}>{values[name]}</Typography>;
  }

  const { InputProps, disabled, ...textFieldProps } = otherProps;

  const { multiple, checked, ...fieldProps } = getFieldProps(name);
  const { error, touched } = getFieldMeta(name);
  const props = {
    label: startCase(name),
    margin: 'normal',
    size: 'small',
    fullWidth: true,
    autoComplete: kebabCase(name),
    disabled: isSubmitting || disabled,
    ...textFieldProps,
    InputProps: { ...InputProps, inputRef: ref },
    ...fieldProps,
    error: !!(touched && error),
    helperText: touched && error
  };

  return <TextField {...props} />;
}

const SwitchingTextField = forwardRef(SwitchingTextFieldComponent);

SwitchingTextField.propTypes = {
  ...TextField.propTypes,
  name: string.isRequired,
  typographyProps: shape({ ...Typography.propTypes }),
};

export default SwitchingTextField;