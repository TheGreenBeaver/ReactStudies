import { shape, object, arrayOf, string } from 'prop-types';
import SmartForm from '../../../uiKit/SmartForm';
import { Form } from 'formik';
import GitHubTokenField from '../../../uiKit/SmartForm/fields/GitHubTokenField';
import { TEMPLATE_KINDS, TEMPLATE_TITLES, TOKEN_FIELDS } from '../../../util/constants';
import configFields from './configFields';
import StandardSelectField from '../../../uiKit/SmartForm/fields/StandardSelectField';
import { getOptions } from '../../../util/misc';
import StandardTextField from '../../../uiKit/SmartForm/fields/StandardTextField';
import React, { Fragment, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import GeneralError from '../../../uiKit/SmartForm/interactions/GeneralError';
import { string as yupString, array } from 'yup';
import TextGroupField from '../../../uiKit/SmartForm/fields/TextGroupField';
import groupBy from 'lodash/groupBy';
import startCase from 'lodash/startCase';
import Typography from '@mui/material/Typography';
import api from '../../../api';
import { useHistory } from 'react-router-dom';
import useAlert from '../../../hooks/useAlert';
import links from '../../config/links';


const METHODS = {
  post: 'POST',
  patch: 'PATCH',
  put: 'PUT'
};

const methodOptions = getOptions(METHODS);

function getTemplateKind(fieldName) {
  const splitName = startCase(fieldName).split(' ');
  return splitName.slice(0, splitName.length - 1).join('_').toLowerCase();
}

function getShallowFieldName(fieldName) {
  const splitName = startCase(fieldName).split(' ');
  return splitName[splitName.length - 1].toLowerCase();
}

const AUTH_FIELDS = ['Sign Up', 'Log In', 'Verification'];
const SPECIAL_LABELS = {
  [TEMPLATE_KINDS.auth]: 'Route only allowed for authorized users',
  [TEMPLATE_KINDS.entityList]: 'API endpoint returning search results'
};

function ConfigureReactSolution({ task: { id, reactTask }, missingFields }) {
  const history = useHistory();
  const showAlert = useAlert();

  const initialValues = useMemo(() => missingFields.reduce((values, fieldName) => {
    let fieldValue;
    if (fieldName === configFields.dumpUploadMethod) {
      fieldValue = methodOptions[0].value;
    } else if (/Routes|Endpoints$/.test(fieldName)) {
      const templateKind = getTemplateKind(fieldName);
      const shallowFieldName = getShallowFieldName(fieldName);
      const teacherCfg = reactTask.teacherTemplateConfigs.find(cfg => cfg.kind === templateKind)[shallowFieldName];
      fieldValue = teacherCfg.length ? teacherCfg : [''];
    } else {
      fieldValue = '';
    }
    return { ...values, [fieldName]: fieldValue };
  }, {}), [missingFields, reactTask]);

  const validationSchema = useMemo(() => missingFields.reduce((schema, fieldName) => {
    let fieldSchema;
    if (fieldName === configFields.dumpUploadUrl) {
      fieldSchema = yupString().absoluteUrl().required();
    } else if (fieldName.endsWith('Routes')) {
      const baseSchema = yupString().navRoute().required('Route is required');
      const entrySchema = reactTask.dump && fieldName.startsWith('singleEntity') ? baseSchema.keyPattern() : baseSchema;
      fieldSchema = array().of(entrySchema);
    } else if (fieldName.endsWith('Endpoints')) {
      fieldSchema = array().of(yupString().relativeUrl().required('Endpoints must not be empty')).min(1);
    } else if (fieldName.endsWith('Special')) {
      fieldSchema = yupString()[fieldName.startsWith('auth') ? 'relativeUrl' : 'navRoute']().required();
    }
    return fieldSchema ? { ...schema, [fieldName]: fieldSchema } : schema;
  }, {}), [missingFields]);

  const groupedFields = useMemo(
    () => groupBy(missingFields, getTemplateKind),
    [missingFields]
  );
  return (
    <SmartForm
      initialValues={{
        [TOKEN_FIELDS.gitHubToken]: '',
        [TOKEN_FIELDS.rememberToken]: true,
        ...initialValues
      }}
      onSubmit={values => api.solutions
        .create({ ...values, taskId: id })
        .then(({ data }) => {
          showAlert('Solution created, the repository will be ready soon', 'success');
          history.push(links.solutions.singleSolution.compose(data.id));
        })
      }
      doNotPopulate
      validationSchema={validationSchema}
      fast
    >
      <Form>
        {groupedFields.dump_upload && (
          <>
            <Typography variant='h6'>Dump Data upload</Typography>
            <Grid container spacing={2}>
              {missingFields.includes(configFields.dumpUploadMethod) && (
                <Grid item xs={4}>
                  <StandardSelectField
                    name={configFields.dumpUploadMethod}
                    options={methodOptions}
                    label='Method'
                  />
                </Grid>
              )}
              {missingFields.includes(configFields.dumpUploadUrl) && (
                <Grid item xs={4}>
                  <StandardTextField name={configFields.dumpUploadUrl} label='URL' />
                </Grid>
              )}
            </Grid>
          </>
        )}
        {Object.entries(groupedFields).filter(([group]) => group !== 'dump_upload').map(([templateKind, fieldNames]) => {
          const title = TEMPLATE_TITLES[templateKind];
          const isAuth = templateKind === TEMPLATE_KINDS.auth;
          return (
            <Fragment key={templateKind}>
              <Typography variant='h6'>{title}</Typography>
              {fieldNames.map(fieldName => {
                if (fieldName.endsWith('Special')) {
                  return (
                    <Grid container key={fieldName} spacing={2}>
                      <Grid item xs={4}>
                        <StandardTextField name={fieldName} label={SPECIAL_LABELS[templateKind]} />
                      </Grid>
                    </Grid>
                  );
                }

                const isEndpoints = fieldName.endsWith('Endpoints');
                const suffix = isEndpoints ? 'API endpoint' : 'Route';
                const singleLabel = isEndpoints ? 'API endpoints' : ['Route'];
                let helpTexts;
                if (!isEndpoints && templateKind === TEMPLATE_KINDS.singleEntity) {
                  helpTexts = reactTask.dump
                    ? ['Pattern containing {key} placeholder to replace with one of the keys returned on dump upload']
                    : ['Exact route leading to some one entity that\'s sure to be in the database'];
                }
                return (
                  <TextGroupField
                    key={fieldName}
                    name={fieldName}
                    labels={isAuth ? AUTH_FIELDS.map(f => `${f} ${suffix}`) : singleLabel}
                    getDisabled={isAuth ? idx => !!initialValues[fieldName][idx] : undefined}
                    max={3}
                    helpTexts={helpTexts}
                  />
                );
              })}
            </Fragment>
          );
        })}
        <Box display='flex' justifyContent='end' width='100%' mt={3}>
          <GitHubTokenField entity='solution' action='create' sx={{ width: '25%' }} />
        </Box>
        <GeneralError />
      </Form>
    </SmartForm>
  );
}

ConfigureReactSolution.propTypes = {
  task: shape({ reactTask: object.isRequired }).isRequired,
  missingFields: arrayOf(string).isRequired
};

export default ConfigureReactSolution;