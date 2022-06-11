import React, { useEffect } from 'react';
import { string, bool, oneOfType, node, arrayOf } from 'prop-types';
import useEditableView from '../../../../hooks/useEditableView';
import Box from '@mui/material/Box';
import Layout from '../../../Layout';
import Add from '@mui/icons-material/Add';
import Upload from '@mui/icons-material/Upload';
import InputLabel from '@mui/material/InputLabel';
import UploadArea from './UploadArea';
import { MultiField, Ratio, StyleProp } from '../../../../util/types';
import { STANDARD_RATIO } from '../../../../util/constants';
import FilePreview from '../../../FilePreview';
import { combineRefs, getBaseAndExt, getUpd } from '../../../../util/misc';
import SwitchingTextField from '../SwitchingTextField';
import useScrollbarCompensation from '../../../../hooks/useScrollbarCompensation';
import FormHelperText from '@mui/material/FormHelperText';
import useScrollToNewInput from '../../../../hooks/useScrollToNewInput';
import InputAdornment from '@mui/material/InputAdornment';


function getLabel(label) {
  return typeof label === 'string' ? <InputLabel>{label}</InputLabel> : label;
}

function FileField({ label, height, ratio, width, name, multiple, accept }) {
  const {
    values,
    setFieldValue,
    errors,
    touched,
    isEditing,
    isSubmitting,
    setFieldTouched
  } = useEditableView();

  const disabled = !isEditing || isSubmitting;

  const [fileRowMb, trackFileRowOverflow, fileRowRef] = useScrollbarCompensation();
  const [refRowMb, trackRefRowOverflow, refRowRef] = useScrollbarCompensation();

  const [fileFieldName, refFieldName] = Array.isArray(name) ? name : [name, null];
  const [fileFieldLabel, refFieldLabel] = Array.isArray(label) ? label : [label, null];

  const fileFieldValue = values[fileFieldName];
  const refFieldValue = refFieldName ? values[refFieldName] : null;

  const { onDelete, inputsWrapperRef, newInputRef } = useScrollToNewInput(refFieldValue)

  const fileFieldError = !disabled && touched[fileFieldName] && errors[fileFieldName];

  useEffect(() => {
    if (!refFieldName) {
      trackFileRowOverflow()
    }
  }, [fileFieldValue, refFieldName]);

  useEffect(() => {
    trackRefRowOverflow();
  }, [refFieldValue]);

  const hasValue = multiple ? !!fileFieldValue.length : !!fileFieldValue;

  function setFileFieldValue(upd) {
    const newFileFieldValue = getUpd(upd, fileFieldValue);
    setFieldValue(fileFieldName, newFileFieldValue, true);
    setFieldTouched(fileFieldName, true, false);
    return newFileFieldValue;
  }

  function setRefFieldValue(upd) {
    if (refFieldName) {
      const newRefFieldValue = getUpd(upd, refFieldValue);
      setFieldValue(refFieldName, newRefFieldValue, false);
      setFieldTouched(refFieldName, true, false);
      return newRefFieldValue;
    }
  }

  function clearValue(idx) {
    const upd = multiple ? curr => curr.filter((_, entryIdx) => entryIdx !== idx) : null;
    setFileFieldValue(upd);
    setRefFieldValue(upd);
  }

  function getContent() {
    if (!multiple) {
      return (
        <Box width={width}>
          <UploadArea
            accept={accept}
            multiple={multiple}
            ratio={ratio}
            width={width}
            onChange={setFileFieldValue}
            disabled={disabled}
            error={!!fileFieldError}
            content={
              <Layout.Center>
                {
                  hasValue
                    ? <FilePreview
                      file={fileFieldValue}
                      ratio={ratio}
                      width='90%'
                      onRemove={isEditing ? e => {
                        e.stopPropagation();
                        clearValue();
                      } : undefined}
                    />
                    : <Upload sx={{ fontSize: '3em' }} />
                }
              </Layout.Center>
            }
          />
          <FormHelperText error>
            {fileFieldError}
          </FormHelperText>
          {
            refFieldName &&
            <SwitchingTextField
              label={refFieldLabel}
              name={refFieldName}
              InputProps={{
                endAdornment:
                  <InputAdornment position='end'>
                    {getBaseAndExt(fileFieldValue)[1]}
                  </InputAdornment>,
                sx: {
                  '& input': {
                    pr: 0.5,
                    borderRight: theme => `1px solid ${theme.palette.divider}`
                  },
                },
              }}
              autoComplete='false'
              sx={{ width: '100%', mt: 0.5 }}
              typographyProps={{ sx: { width: '100%', mt: 0.5 } }}
            />
          }
        </Box>
      );
    }

    return (
      <>
        <Box display='flex' columnGap={1.5} width={width}>
          <UploadArea
            accept={accept}
            multiple={multiple}
            width={height}
            ratio={{ w: 1, h: 1 }}
            content={
              <Layout.Center>
                <Add sx={{ fontSize: '2.5em' }} />
              </Layout.Center>
            }
            onChange={upd => {
              const newFileFieldValue = setFileFieldValue(upd);
              if (refFieldName) {
                setRefFieldValue(curr => {
                  const added = newFileFieldValue.slice(curr.length);
                  return [...curr, ...added.map(f => f.name.replace(/(?<!^)\.\w+$/, ''))];
                });
              }
            }}
            disabled={disabled}
          />

          <Box
            display='flex'
            sx={refFieldName ? {
              overflow: 'hidden',
            } : {
              overflowX: 'auto', overflowY: 'hidden', mb: fileRowMb
            }}
            ref={fileRowRef}
            columnGap={1}
          >
            {
              fileFieldValue.map((file, idx) =>
                <Box key={idx}>
                  <Layout.Center
                    width={height}
                    minWidth={height}
                    height={height}
                    sx={{
                      borderColor: theme => fileFieldError?.[idx]
                        ? theme.palette.error.main
                        : theme.palette.input.standard,
                      borderRadius: '4px',
                      borderWidth: 1,
                      borderStyle: 'solid',
                    }}
                    mb={0.5}
                  >
                    <FilePreview
                      onRemove={isEditing ? () => {
                        clearValue(idx);
                        onDelete();
                      } : undefined}
                      width='90%'
                      ratio={{ w: 1, h: 1 }}
                      file={file}
                    />
                  </Layout.Center>
                  <FormHelperText error sx={{ width: height }}>
                    {fileFieldError?.[idx]}
                  </FormHelperText>
                </Box>,
              )
            }
          </Box>
        </Box>
        {
          refFieldName && !!fileFieldValue.length &&
          <Box mt={0.5} display='flex' alignItems='stretch' columnGap={1.5} width={width}>
            <Box width={height} minWidth={height} display='flex'>
              {refFieldLabel && <InputLabel sx={{ mb: 0, mt: 1 }}>{refFieldLabel}:</InputLabel>}
            </Box>
            <Box
              display='flex'
              sx={{ overflowX: 'auto', overflowY: 'hidden', mb: refRowMb }}
              columnGap={1}
              onScroll={e => {
                if (fileRowRef.current) {
                  fileRowRef.current.scrollLeft = e.target.scrollLeft;
                }
              }}
              ref={combineRefs(refRowRef, inputsWrapperRef)}
            >
              {[...Array(fileFieldValue.length)].map((_, idx) =>
                <SwitchingTextField
                  margin='none'
                  key={idx}
                  ref={idx === fileFieldValue.length - 1 ? newInputRef : undefined}
                  name={`${refFieldName}[${idx}]`}
                  label={null}
                  autoComplete='false'
                  InputProps={{
                    endAdornment:
                      <InputAdornment position='end'>
                        {getBaseAndExt(fileFieldValue[idx])[1]}
                      </InputAdornment>,
                    sx: {
                      '& input': {
                        pr: 0.5,
                        borderRight: theme => `1px solid ${theme.palette.divider}`
                      },
                    },
                  }}
                  typographyProps={{ width: height, minWidth: height }}
                  sx={{ width: height, minWidth: height }}
                />,
              )}
            </Box>
          </Box>
        }
      </>
    );
  }

  return (
    <>
      {fileFieldLabel && getLabel(fileFieldLabel)}
      {getContent()}
    </>
  );
}

FileField.propTypes = {
  name: MultiField.isRequired,
  accept: string.isRequired,
  label: oneOfType([node, arrayOf(node)]),
  multiple: bool,
  width: StyleProp,
  height: StyleProp,
  ratio: Ratio
};

FileField.defaultProps = {
  multiple: false,
  ratio: STANDARD_RATIO,
  width: '100%'
};

export default FileField;