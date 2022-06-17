import { number, string } from 'prop-types';
import useEditableView from '../../../../hooks/useEditableView';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import { getUpd } from '../../../../util/misc';
import Typography from '@mui/material/Typography';
import get from 'lodash/get';
import Collapse from '@mui/material/Collapse';
import useCollapse from '../../../../hooks/useCollapse';


function MaxUsage({ name, recommended }) {
  const { values, errors, touched, setFieldTouched, setFieldValue, isSubmitting } = useEditableView();

  const value = get(values, name);
  const error = get(errors, name);
  const fieldTouched = get(touched, name);
  const enteringPercentage = value != null;

  function setValue(upd) {
    setFieldValue(name, getUpd(upd, value));
  }

  function setEnteringPercentage(newEnteringPercentage) {
    setValue(newEnteringPercentage ? recommended : null);
  }

  const [collapseProps, closeCollapse] = useCollapse(
    () => setEnteringPercentage(false), enteringPercentage
  );

  function toggleEnteringPercentage({ target: { checked } }) {
    if (checked) {
      setEnteringPercentage(true);
    } else {
      closeCollapse();
    }
  }

  function onChange({ target: { value: inputValue } }) {
    const cleanInputValue = inputValue.replace(/\D/g, '');
    let valueToSet;
    if (!cleanInputValue) {
      valueToSet = '';
    } else {
      valueToSet = parseInt(cleanInputValue);
    }
    setValue(valueToSet);
  }

  return (
    <Box>
      <FormControlLabel
        control={<Checkbox onChange={toggleEnteringPercentage} checked={enteringPercentage} />}
        label='Fail if used too widely'
        disabled={isSubmitting}
      />
      <Collapse {...collapseProps} orientation='vertical'>
        <Box display='flex' columnGap={0.5}>
          <Typography mt={1}>Usage threshold:</Typography>
          <TextField
            sx={{ width: 100 }}
            size='small'
            margin='none'
            inputProps={{ inputMode: 'numeric' }}
            value={String(value)}
            onChange={onChange}
            onBlur={() => setFieldTouched(name, true)}
            error={!!(fieldTouched && error)}
            helperText={fieldTouched && error}
            InputProps={{ endAdornment: '%' }}
            disabled={isSubmitting}
          />
        </Box>
      </Collapse>
    </Box>
  )
}

MaxUsage.propTypes = {
  name: string.isRequired,
  recommended: number,
};

MaxUsage.defaultProps = {
  recommended: 25
};

export default MaxUsage;