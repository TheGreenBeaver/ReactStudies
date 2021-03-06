import Grid from '@mui/material/Grid';
import StandardTextField from '../../../uiKit/SmartForm/fields/StandardTextField';
import fieldNames from '../fieldNames';
import StandardSelectField from '../../../uiKit/SmartForm/fields/StandardSelectField';
import MarkdownField from '../../../uiKit/SmartForm/fields/MarkdownField';
import { TASK_KIND_DEFINITIONS } from '../../../util/constants';
import FileField from '../../../uiKit/SmartForm/fields/FileField';
import fieldAccepts from '../fieldAccepts';
import { useFormikContext } from 'formik';
import CheckboxField from '../../../uiKit/SmartForm/fields/CheckboxField';
import { getOptions } from '../../../util/misc';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import HelpBadge from '../../../uiKit/HelpBadge';
import { bool } from 'prop-types';


const taskKindOptions = getOptions(TASK_KIND_DEFINITIONS);

function GeneralSettings({ canChangeKind }) {
  const { values } = useFormikContext();
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid item xs={8}>
        <StandardTextField name={fieldNames.title} />
      </Grid>
      <Grid item xs={4}>
        <StandardSelectField
          name={fieldNames.kind}
          options={taskKindOptions}
          label='Task type'
          disabled={!canChangeKind}
        />
      </Grid>
      <Grid item xs={12}>
        <CheckboxField
          label={
            <HelpBadge helpText='Changes you manually make to ./attachments and README.md will be reflected here'>
              <Typography>Track updates from GitHub</Typography>
            </HelpBadge>
          }
          name={fieldNames.trackUpdates}
        />
      </Grid>
      <Grid item xs={12}>
        <HelpBadge helpText='This will be placed in README.md'>
          <InputLabel>Extra notes</InputLabel>
        </HelpBadge>
        <MarkdownField
          name={fieldNames.description}
          localFiles={values[fieldNames.attachments]}
          localFilesRefs={values[fieldNames.attachmentNames]}
        />
      </Grid>
      <Grid item xs={12}>
        <FileField
          accept={fieldAccepts[fieldNames.attachments]}
          name={[fieldNames.attachments, fieldNames.attachmentNames]}
          multiple
          width='100%'
          height='140px'
          label={[
            <HelpBadge helpText='These will be stored in the repo at ./attachments under the reference names you set'>
              <InputLabel>Attachments</InputLabel>
            </HelpBadge>,
            'Reference names'
          ]}
        />
      </Grid>
    </Grid>
  );
}

GeneralSettings.propTypes = {
  canChangeKind: bool,
};

export default GeneralSettings;