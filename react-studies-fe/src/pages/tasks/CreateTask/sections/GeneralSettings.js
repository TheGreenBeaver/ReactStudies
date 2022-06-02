import Grid from '@mui/material/Grid';
import StandardTextField from '../../../../uiKit/SmartForm/fields/StandardTextField';
import fieldNames from '../fieldNames';
import StandardSelectField from '../../../../uiKit/SmartForm/fields/StandardSelectField';
import MarkdownField from '../../../../uiKit/SmartForm/fields/MarkdownField';
import { TASK_KIND_DEFINITIONS } from '../../../../util/constants';
import FileField from '../../../../uiKit/SmartForm/fields/FileField';
import fieldAccepts from '../fieldAccepts';
import { useFormikContext } from 'formik';
import CheckboxField from '../../../../uiKit/SmartForm/fields/CheckboxField';
import { getOptions } from '../../../../util/misc';


const taskKindOptions = getOptions(TASK_KIND_DEFINITIONS);

function GeneralSettings() {
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
        />
      </Grid>
      <Grid item xs={12}>
        <CheckboxField label='Track updates from GitHub' name={fieldNames.trackUpdates} />
      </Grid>
      <Grid item xs={12}>
        <MarkdownField
          label='Description'
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
          label={['Attachments', 'Reference names']}
        />
      </Grid>
    </Grid>
  );
}

export default GeneralSettings;