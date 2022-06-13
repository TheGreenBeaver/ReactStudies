import HelpBadge from '../../../../../uiKit/HelpBadge';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import fieldNames from '../../../fieldNames';
import WarningAmber from '@mui/icons-material/WarningAmber';
import FileField from '../../../../../uiKit/SmartForm/fields/FileField';
import fieldAccepts from '../../../fieldAccepts';
import StandardTextField from '../../../../../uiKit/SmartForm/fields/StandardTextField';
import StandardSelectField from '../../../../../uiKit/SmartForm/fields/StandardSelectField';
import DumpSyntaxModal from './DumpSyntaxModal';
import { useFormikContext } from 'formik';
import useCollapse from '../../../../../hooks/useCollapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import { getOptions } from '../../../../../util/misc';


const METHODS = {
  post: 'POST',
  patch: 'PATCH',
  put: 'PUT'
};

const methodOptions = getOptions(METHODS, 'Clear')

function DumpInput() {
  const { setFieldValue, values, setValues, isSubmitting } = useFormikContext();

  const withDump = values[fieldNames.dumpIsTemplate] != null;

  function setWithDump(newWithDump) {
    const upd = newWithDump
      ? {
        [fieldNames.dumpIsTemplate]: true,
        [fieldNames.dumpUploadUrl]: '',
        [fieldNames.dumpUploadMethod]: methodOptions[0].value,
      } : {
        [fieldNames.fileDump]: null,
        [fieldNames.dumpIsTemplate]: null,
        [fieldNames.dumpUploadUrl]: null,
        [fieldNames.dumpUploadMethod]: null,
      };
    setValues(curr => ({ ...curr, ...upd }));
  }

  const [collapseProps, closeCollapse] = useCollapse(() => setWithDump(false), withDump);

  function toggleWithDump({ target: { checked } }) {
    if (checked) {
      setWithDump(true);
    } else {
      closeCollapse();
    }
  }

  return (
    <Box mt={2}>
      <FormControlLabel
        label={
          <HelpBadge helpText='Upload data to the server before testing'>
            <Typography variant='h6'>Data dump</Typography>
          </HelpBadge>
        }
        disabled={isSubmitting}
        control={<Checkbox onChange={toggleWithDump} checked={withDump} />}
      />
      <Collapse {...collapseProps} orientation='vertical'>
        <Box display='flex' alignItems='center' columnGap={1}>
          <Typography>Raw data</Typography>
          <Switch
            disabled={isSubmitting}
            checked={values[fieldNames.dumpIsTemplate]}
            onChange={e => setFieldValue(fieldNames.dumpIsTemplate, e.target.checked)}
          />
          <HelpBadge helpText='Dataset will be randomly generated based on the rules you enter'>
            <Typography>Template</Typography>
          </HelpBadge>
        </Box>
        <Box display='flex' alignItems='center' height={40}>
          {!values[fieldNames.dumpIsTemplate] ? (
            <Box color='warning.main' display='flex' alignItems='center' mb={1} columnGap={1}>
              <WarningAmber />
              <Typography>
                Data will be uploaded to the database as is. Make sure it's an array of proper entries
              </Typography>
            </Box>
          ) : (
            <DumpSyntaxModal />
          )}
        </Box>

        <Box display='flex' columnGap={2}>
          <FileField
            accept={fieldAccepts[fieldNames.fileDump]}
            name={fieldNames.fileDump}
            width={200}
          />

          <HelpBadge helpText='The response must be an array with keys for generated database instances'>
            <Box>
              <StandardTextField margin='none' name={fieldNames.dumpUploadUrl} />
              <StandardSelectField
                name={fieldNames.dumpUploadMethod}
                options={methodOptions}
              />
            </Box>
          </HelpBadge>
        </Box>
      </Collapse>
    </Box>
  )
}

export default DumpInput;