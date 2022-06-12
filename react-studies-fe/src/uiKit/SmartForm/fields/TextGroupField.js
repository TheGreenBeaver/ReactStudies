import { arrayOf, number, oneOfType, string, func } from 'prop-types';
import MultiTextField from './MultiTextField';
import { useFormikContext } from 'formik';
import { getUpd } from '../../../util/misc';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import StandardTextField from './StandardTextField';
import Grid from '@mui/material/Grid';
import HelpBadge from '../../HelpBadge';


function TextGroupField({ labels, name, max, getDisabled, helpTexts }) {
  const { getFieldHelpers, getFieldMeta, setFieldTouched } = useFormikContext();
  const { value, error } = getFieldMeta(name);

  if (Array.isArray(labels)) {
    return (
      <Grid container spacing={2}>
        {value.map((_, idx) => (
          <Grid item key={idx} xs={12 / max}>
            {helpTexts?.[idx] ? (
              <HelpBadge helpText={helpTexts?.[idx]} sx={{ top: theme => theme.spacing(1.5) }}>
                <StandardTextField
                  sx={{ flex: 1 }}
                  label={labels[idx]}
                  name={`${name}[${idx}]`}
                  disabled={getDisabled(idx)}
                />
              </HelpBadge>
            ) : (
              <StandardTextField
                sx={{ flex: 1 }}
                label={labels[idx]}
                name={`${name}[${idx}]`}
                disabled={getDisabled(idx)}
              />
            )}
          </Grid>
        ))}
      </Grid>
    );
  }

  const { setValue } = getFieldHelpers(name);

  return (
    <Box>
      {helpTexts ? (
        <HelpBadge helpText={helpTexts}>
          <InputLabel sx={{ mt: 1 }}>{labels}</InputLabel>
        </HelpBadge>
      ) : (
        <InputLabel sx={{ mt: 1 }}>{labels}</InputLabel>
      )}
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

TextGroupField.propTypes = {
  labels: oneOfType([string, arrayOf(string)]).isRequired,
  name: string.isRequired,
  max: number,
  getDisabled: func
};

TextGroupField.defaultProps = {
  getDisabled: () => false,
};

export default TextGroupField;