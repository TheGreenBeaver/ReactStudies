import { arrayOf, number, oneOfType, string } from 'prop-types';
import MultiTextField from '../MultiTextField';
import { useFormikContext } from 'formik';
import { getUpd } from '../../../../util/misc';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import StandardTextField from '../StandardTextField';
import Grid from '@mui/material/Grid';


function TextGroup({ labels, name, max }) {
  const { getFieldHelpers, getFieldMeta, setFieldTouched } = useFormikContext();

  if (Array.isArray(labels)) {
    return (
      <Grid container spacing={2}>
        {labels.map((label, idx) => (
          <Grid item key={idx} xs={12 / max}>
            <StandardTextField sx={{ flex: 1 }} label={label} name={`${name}[${idx}]`} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const { setValue } = getFieldHelpers(name);
  const { value, error } = getFieldMeta(name);

  return (
    <Box>
      <InputLabel sx={{ mt: 1 }}>{labels}</InputLabel>
      <MultiTextField
        maxWidth='100%'
        onChange={upd => setValue(getUpd(upd, value))}
        onBlur={idx => setFieldTouched(`${name}[${idx}]`, true)}
        getErrorProps={idx => ({
          helperText: error?.[idx],
          error: !!error?.[idx]
        })}
        value={value}
      />
    </Box>
  );
}

TextGroup.propTypes = {
  labels: oneOfType([string, arrayOf(string)]).isRequired,
  name: string.isRequired,
  max: number.isRequired
};

export default TextGroup;