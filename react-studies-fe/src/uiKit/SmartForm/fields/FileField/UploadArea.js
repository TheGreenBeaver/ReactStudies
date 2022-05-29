import React, { useRef } from 'react';
import { string, bool, node, func } from 'prop-types';
import Box from '@mui/material/Box';
import { blockEvent } from '../../../../util/misc';
import { Ratio, StyleProp } from '../../../../util/types';
import { STANDARD_RATIO } from '../../../../util/constants';
import Layout from '../../../Layout';


function UploadArea({
  accept,
  multiple,
  content,
  ratio,
  width,
  onChange,
  disabled,
  error
}) {
  const inputRef = useRef(null);

  function onFileAdd(_files) {
    const files = [..._files];
    if (!files.length) {
      return;
    }

    onChange(curr => multiple ? [...curr, ...files] : files[0]);
  }

  function onClick() {
    if (!disabled) {
      inputRef.current.click();
    }
  }

  function onDrop(e) {
    blockEvent(e);
    if (!disabled) {
      const transferItems = e.dataTransfer.items;
      if (!transferItems) {
        return;
      }
      onFileAdd([...transferItems].map(item => item.getAsFile()));
    }
  }

  return (
    <Box width={width} minWidth={width}>
      <Layout.Ratio ratio={ratio} width={100}>
        <Box
          onClick={onClick}
          onDragOver={blockEvent}
          onDrop={onDrop}
          sx={{
            position: 'relative',
            cursor: !disabled ? 'pointer' : 'default',
            borderStyle: 'solid',
            borderRadius: '4px',
            borderWidth: 1,
            height: '100%',
            width: '100%',
            borderColor: theme => error
              ? `${theme.palette.error.main} !important`
              : theme.palette.input.standard,
            transition: theme => theme.transitions.create('border-color'),

            '& > div > .MuiSvgIcon-root': {
              color: theme => error
                ? `${theme.palette.error.main} !important`
                : theme.palette.input.standard,
              transition: theme => theme.transitions.create('color'),
            },

            ...(!disabled ? {
              '&:hover': {
                borderWidth: 2,
                borderColor: theme => theme.palette.primary.light,

                '& > div > .MuiSvgIcon-root': {
                  color: theme => theme.palette.primary.light,
                },
              },
            } : undefined),
          }}
        >
          {content}
          <input
            type='file'
            multiple={multiple}
            ref={inputRef}
            disabled={disabled}
            accept={accept}
            style={{ display: 'none' }}
            onChange={e => onFileAdd(e.target.files)}
          />
        </Box>
      </Layout.Ratio>
    </Box>
  );
}

UploadArea.propTypes = {
  accept: string.isRequired,
  onChange: func.isRequired,
  width: StyleProp.isRequired,
  disabled: bool,
  error: bool,
  multiple: bool,
  content: node,
  ratio: Ratio,
};

UploadArea.defaultProps = {
  multiple: false,
  ratio: STANDARD_RATIO
};

export default UploadArea;