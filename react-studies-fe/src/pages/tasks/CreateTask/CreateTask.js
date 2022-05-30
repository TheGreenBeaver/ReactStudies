import SmartForm from '../../../uiKit/SmartForm';
import api from '../../../api';
import { useHistory } from 'react-router-dom';
import links from '../links';
import Validators from '../../../util/validation';
import { string } from 'yup';
import { ELEMENT_FIELDS, SIZE_UNITS, TASK_KIND_DEFINITIONS, TASK_KINDS, TOKEN_FIELDS } from '../../../util/constants';
import Typography from '@mui/material/Typography';
import fieldNames from './fieldNames';
import GeneralSettings from './sections/GeneralSettings';
import MainTypeSettings from './sections/MainTypeSettings';
import SectionWrapper from './SectionWrapper';
import AdvancedTypeSettings from './sections/AdvancedTypeSettings';
import React, { useState } from 'react';
import { getUpd } from '../../../util/misc';
import fieldAccepts from './fieldAccepts';
import { finishSubmit, getFormData } from '../../../util/form';
import GitHubTokenField from '../../../uiKit/SmartForm/fields/GitHubTokenField';
import { Form } from 'formik';
import GeneralError from '../../../uiKit/SmartForm/interactions/GeneralError';
import Box from '@mui/material/Box';


const SECTION_NAMES = {
  general: 'general',
  main: 'main',
  advanced: 'advanced',
};

const sections = [
  {
    name: SECTION_NAMES.general,
    Component: GeneralSettings,
    title: 'General settings',
    coveredFields: [
      fieldNames.kind,
      fieldNames.title,
      fieldNames.description,
      fieldNames.attachments,
      fieldNames.attachmentNames,
      fieldNames.trackUpdates
    ]
  },
  {
    name: SECTION_NAMES.main,
    Component: MainTypeSettings,
    title: ({ values }) => {
      const taskDefinition = TASK_KIND_DEFINITIONS[values[fieldNames.kind]];
      return `Main settings for ${taskDefinition} task`;
    },
    coveredFields: [fieldNames.sampleImage]
  },
  {
    name: SECTION_NAMES.advanced,
    Component: AdvancedTypeSettings,
    title: ({ values }) => {
      const taskDefinition = TASK_KIND_DEFINITIONS[values[fieldNames.kind]];
      return `Advanced settings for ${taskDefinition} task`;
    },
    coveredFields: [fieldNames.mustUse, fieldNames.absPos, fieldNames.rawSizing]
  }
];

const fieldsForKinds = {
  [TASK_KINDS.layout]: [fieldNames.sampleImage, fieldNames.mustUse, fieldNames.absPos, fieldNames.rawSizing],
  [TASK_KINDS.react]: []
};

function CreateTask() {
  const history = useHistory();
  const [sectionsExpanded, setSectionsExpanded] = useState({
    [SECTION_NAMES.general]: true,
    [SECTION_NAMES.main]: true,
    [SECTION_NAMES.advanced]: false
  });

  function onSubmit(values, formikHelpers) {
    const kind = values[fieldNames.kind];
    const fields = [
      ...fieldsForKinds[kind],
      ...sections.find(({ name }) => name === SECTION_NAMES.general).coveredFields,
      ...Object.values(TOKEN_FIELDS)
    ];
    const formData = getFormData(values, fields);
    finishSubmit(api.tasks.create(formData).then(({ data }) =>
      history.push(links.singleTask.compose(data.id)),
    ), formikHelpers);
  }

  return (
    <>
      <Typography variant='h4' mb={2}>Create new task</Typography>
      <SmartForm
        onSubmit={onSubmit}
        noSubmitLogic
        fast
        doNotPopulate
        initialValues={{
          [TOKEN_FIELDS.gitHubToken]: '',
          [TOKEN_FIELDS.rememberToken]: true,

          [fieldNames.kind]: TASK_KINDS.layout,
          [fieldNames.trackUpdates]: false,
          [fieldNames.title]: '',
          [fieldNames.description]: '',
          [fieldNames.attachments]: [],
          [fieldNames.attachmentNames]: [],

          [fieldNames.sampleImage]: null,
          [fieldNames.mustUse]: [],
          [fieldNames.absPos]: null,
          [fieldNames.rawSizing]: null
        }}
        validationSchema={{
          [fieldNames.title]: Validators.standardText(30),
          [fieldNames.attachments]: Validators.file(
            fieldAccepts[fieldNames.attachments],
            [10, SIZE_UNITS.MB],
            { multiple: true }
          ),
          [fieldNames.attachmentNames]: Validators.uniqList(
            string().max(30).matches(
              /^[-.\w _\d]+$/,
              'Allowed characters are latin letters, spaces, dots, underscores, hyphens and numbers',
            ).required('Names must not be empty'), 'Reference name'
          ),

          [fieldNames.sampleImage]: Validators.file(
            fieldAccepts[fieldNames.sampleImage],
            [4, SIZE_UNITS.MB]
          ).when(fieldNames.kind, {
            is: TASK_KINDS.layout,
            then: schema => schema.required(),
            otherwise: schema => schema.optional()
          }),
          [fieldNames.mustUse]: Validators.elementList([ELEMENT_FIELDS.tag]),
          [fieldNames.absPos]: Validators.caveat(),
          [fieldNames.rawSizing]: Validators.caveat()
        }}
        onValidationFailed={errors => {
          const toExpand = sections.reduce((result, { coveredFields, name }) =>
            coveredFields.some(field => field in errors) ? { ...result, [name]: true } : result, {}
          );
          setSectionsExpanded(curr => ({ ...curr, ...toExpand }));
        }}
      >
        <Form>
          {
            sections.map(({ Component, title, name }) =>
              <SectionWrapper
                key={Component.name}
                expanded={sectionsExpanded[name]}
                setExpanded={upd => setSectionsExpanded(curr => ({
                  ...curr,
                  [name]: getUpd(upd, curr[name]),
                }))}
                title={title}
              >
                <Component />
              </SectionWrapper>,
            )
          }
          <Box display='flex' justifyContent='end' width='100%' mt={3}>
            <GitHubTokenField entity='task' action='create' sx={{ width: '50%' }} />
          </Box>
          <GeneralError />
        </Form>
      </SmartForm>
    </>
  )
}

export default CreateTask;