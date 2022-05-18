import React, { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import StandardTextField from './standard-text-field';


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

export default PasswordField;