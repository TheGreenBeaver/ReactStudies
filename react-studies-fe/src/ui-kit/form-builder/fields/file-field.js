import React, { useRef } from 'react';
import { string, bool } from 'prop-types';
import useEditableView from '../util/use-editable-view';
import Box from '@mui/material/Box';
import { CenterBox } from '../../layout';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import { Delete, Upload } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { mimeFits } from '../util/misc';
import { isEmpty } from 'lodash';


function EditableFile({ name, label, accept, multiple }) {
  const inputRef = useRef(null);

  const {
    setFieldValue,
    errors,
    isSubmitting,
    values,
    isEditing,
    setFieldError
  } = useEditableView();

  const fieldError = errors[name];
  const fieldValue = values[name];
  const hasValue = !isEmpty(fieldValue);

  function setVal(val) {
    setFieldValue(name, val);
  }

  function setErr(err) {
    setFieldError(name, err);
  }

  const canBeUsed = isEditing && !isSubmitting;

  function onFileAdd(_files) {
    const files = [..._files];
    const amt = files.length;
    if (!amt) {
      return;
    }

    if (amt > 1 && !multiple) {
      setErr('Please select a single file');
      return;
    }

    for (const file of files) {
      if (!mimeFits(file.type, accept)) {
        setErr(`${file.type} is not a valid type`);
        return;
      }
    }
    setVal(multiple ? files : files[0]);
  }

  function onClick() {
    if (canBeUsed) {
      inputRef.current.click();
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (canBeUsed) {
      const transferItems = e.dataTransfer.items;
      if (!transferItems) {
        return;
      }
      onFileAdd(transferItems.map(item => item.getAsFile()));
    }
  }

  function displayFieldValue() {
    return multiple
      ? fieldValue.map(f => <p>{f.name}</p>)
      : <p>{fieldValue.name}</p>
  }

  return (
    <>
      {label && <Typography>{label}</Typography>}
      <Box
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        sx={{
          position: 'relative',
          cursor: canBeUsed ? 'pointer' : 'default',
          overflow: 'hidden',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderRadius: theme => theme.shape.borderRadius,
          borderColor: theme => theme.palette.grey[700],
          backgroundColor: theme => theme.palette.grey[500],
          transition: theme => theme.transitions.create('borderColor'),

          '& .MuiSvgIcon-root': {
            color: theme => theme.palette.grey[700],
            transition: theme => theme.transitions.create('color')
          },

          '&:hover': canBeUsed ? {
            borderColor: theme => theme.palette.primary.light,
            '& .MuiSvgIcon-root': {
              color: theme => theme.palette.primary.light
            }
          } : undefined,
        }}
      >
        {
          hasValue
            ? displayFieldValue()
            : <CenterBox>
              <Upload sx={{ fontSize: '3em' }} />
            </CenterBox>
        }
        {
          isEditing &&
          <input
            type='file'
            multiple={multiple}
            ref={inputRef}
            disabled={!canBeUsed}
            accept={accept}
            style={{ display: 'none' }}
            onChange={e => onFileAdd(e.target.files)}
          />
        }
      </Box>
      <FormHelperText error>
        {fieldError}
      </FormHelperText>
      {
        isEditing && hasValue &&
        <Box display='flex' justifyContent='flex-end' mt={0.5}>
          <Button
            startIcon={<Delete />}
            onClick={() => setFieldValue(name, null)}
          >
            Clear
          </Button>
        </Box>
      }
    </>
  );
}

EditableFile.propTypes = {
  name: string.isRequired,
  label: string,
  accept: string.isRequired,
  multiple: bool
};

EditableFile.defaultProps = {
  multiple: true
};

export default EditableFile;