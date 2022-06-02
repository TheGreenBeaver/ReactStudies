import { func, bool } from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
import Clear from '@mui/icons-material/Clear';
import useScrollbarCompensation from '../../../../hooks/useScrollbarCompensation';
import { useEffect } from 'react';
import { MultiField } from '../../../../util/types';
import useScrollToNewInput from '../../../../hooks/useScrollToNewInput';
import { combineRefs } from '../../../../util/misc';


function MultiText({ value, onChange, disabled, onBlur, getErrorProps }) {
  const isMulti = Array.isArray(value);
  const [mb, trackOverflow, multiBoxRef] = useScrollbarCompensation();
  const { newInputRef, onDelete, inputsWrapperRef } = useScrollToNewInput(value);

  useEffect(() => {
    if (isMulti) {
      trackOverflow();
    }
  }, [isMulti, value]);

  if (isMulti) {
    return (
      <Box columnGap={0.5} display='flex'>
        <Box
          display='flex'
          columnGap={0.25}
          sx={{ overflowY: 'hidden', overflowX: 'auto', mb }}
          maxWidth={400}
          ref={combineRefs(multiBoxRef, inputsWrapperRef)}
        >
          {value.map((singleValue, idx) =>
            <TextField
              {...getErrorProps(idx)}
              key={idx}
              value={singleValue}
              disabled={disabled}
              onChange={e => onChange(curr => {
                const updated = [...curr];
                updated[idx] = e.target.value;
                return updated;
              })}
              onBlur={() => onBlur(idx)}
              margin='none'
              size='small'
              sx={{ width: 180, minWidth: 180 }}
              InputProps={{
                endAdornment: value.length > 1 &&
                  <IconButton
                    color='error'
                    sx={{ p: 0.5, height: 'fit-content' }}
                    onClick={() => {
                      onChange(curr => curr.filter((_, i) => i !== idx));
                      onDelete();
                    }}
                  >
                    <Clear />
                  </IconButton>,
                inputRef: idx === value.length - 1 ? newInputRef : undefined
              }}
            />,
          )}
        </Box>
        {
          !disabled &&
          <IconButton
            sx={{ p: 0.5, height: 'fit-content', mt: 0.5 }}
            size='small'
            onClick={() => onChange(curr => [...curr, ''])}
          >
            <Add />
          </IconButton>
        }
      </Box>
    );
  }

  return (
    <TextField
      value={value}
      disabled={disabled}
      {...getErrorProps()}
      onChange={e => onChange(e.target.value)}
      onBlur={() => onBlur()}
      margin='none'
      size='small'
    />
  );
}

MultiText.propTypes = {
  value: MultiField,
  getErrorProps: func.isRequired,
  onBlur: func.isRequired,
  onChange: func.isRequired,
  disabled: bool,
};

export default MultiText;