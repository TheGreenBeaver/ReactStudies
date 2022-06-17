import React, { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StandardTextField from './StandardTextField';


function PasswordField(props) {
  const [show, setShow] = useState(false);

  return (
    <StandardTextField
      InputProps={{
        type: show ? 'text' : 'password',
        endAdornment:
          <InputAdornment position='end'>
            <IconButton
              onClick={() => setShow(curr => !curr)}
              edge='end'
            >
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
      }}
      {...props}
    />
  );
}

PasswordField.propTypes = { ...StandardTextField.propTypes };

export default PasswordField;