import { shape, object } from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { COLOUR_MODES, TEMPLATE_KINDS, TEMPLATE_TITLES } from '../../../../util/constants';
import ReactJson from 'react-json-view'
import useColourMode from '../../../../contexts/ColourMode';
import Stack from '@mui/material/Stack';
import Layout from '../../../../uiKit/Layout';
import { Fragment } from 'react';


const TEMPlATE_FLAGS = {
  [TEMPLATE_KINDS.auth]: {
    hasVerification: 'Must implement a mechanism of email verification for new users.'
  },
  [TEMPLATE_KINDS.entityList]: {
    hasSearch: 'Must implement server-side search and filtering.'
  }
};

const AUTH_NAMES_ORDER = [
  { page: 'Sign Up', action: 'sign up request' },
  { page: 'Log In', action: 'log in request' },
  { page: 'Email Verification', action: 'verification request' }
];
const TEMPLATE_DESCRIPTIONS = {
  [TEMPLATE_KINDS.auth]: ({ routes, endpoints, special }) => (
    <Stack direction='column' spacing={0.25}>
      {[...Array(3)].map((_, idx) => {
        const route = routes[idx];
        const endpoint = endpoints[idx];
        if (!route && !endpoint) {
          return null;
        }
        const { page, action } = AUTH_NAMES_ORDER[idx];
        const text = [];
        if (route) {
          text.push(
            <Fragment key='route'>
              <Layout.Code component='span'>{route}</Layout.Code> must lead to {page} page
            </Fragment>
          )
        }
        if (endpoint) {
          if (route) {
            text.push(<Fragment key='comma'>, </Fragment>);
          }
          text.push(<Fragment key='endpoint'><Layout.Code component='span'>{endpoint}</Layout.Code> must be called on {action}</Fragment>);
        }
        return <Typography key={idx}>{text}</Typography>
      })}
      {special && (
        <Typography>
          <Layout.Code component='span'>{special}</Layout.Code> must lead to a page only available for authorized users
        </Typography>
      )}
    </Stack>
  ),
  [TEMPLATE_KINDS.entityList]: ({ routes, endpoints, special }) => (
    <Stack direction='column' spacing={0.25}>
      {routes[0] && <Typography>Page must be located at <Layout.Code component='span'>{routes[0]}</Layout.Code></Typography>}
      {endpoints.some(Boolean) && (
        <Typography display='flex' alignItems='center' columnGap={0.25} flexWrap='wrap'>
          These API endpoints are to be called:
          {endpoints.filter(Boolean).map((ep, idx) => (
            <Layout.Code key={idx} component='span'>{ep}</Layout.Code>
          ))}
        </Typography>
      )}
      {special && <Typography>Search must be performed via {special}</Typography>}
    </Stack>
  ),
  [TEMPLATE_KINDS.singleEntity]: ({ routes, endpoints }) => (
    <Stack direction='column' spacing={0.25}>
      {routes[0] && <Typography>Page must be located at <Layout.Code component='span'>{routes[0]}</Layout.Code></Typography>}
      {endpoints.some(Boolean) && (
        <Typography display='flex' alignItems='center' columnGap={0.25} flexWrap='wrap'>
          These API endpoints are to be called:
          {endpoints.filter(Boolean).map((ep, idx) => (
            <Layout.Code key={idx} component='span'>{ep}</Layout.Code>
          ))}
        </Typography>
      )}
    </Stack>
  )
};

function ReactTaskPreview({ task: { reactTask } }) {
  const { mode } = useColourMode()

  return (
    <>
      {reactTask.hasFuzzing && <Typography><b>Important:</b> the app will be fuzz-tested</Typography>}
      {reactTask.teacherTemplateConfigs.map(cfg => {
        const templateFlags = TEMPlATE_FLAGS[cfg.kind];
        const templateDescription = TEMPLATE_DESCRIPTIONS[cfg.kind];
        return (
          <Box key={cfg.kind}>
            <Typography variant='h6'>{TEMPLATE_TITLES[cfg.kind]}</Typography>
            {templateFlags && Object.entries(templateFlags).map(([flagName, flagText]) => (
              !!reactTask[flagName] && <Typography py={0.25} key={flagName}>{flagText}</Typography>
            ))}
            {templateDescription(cfg)}
          </Box>
        );
      })}
      {reactTask.dump && (
        <Stack spacing={0.5}>
          <Typography>
            The server must allow uploading a set of entries, each having the fields described below:
          </Typography>
          <ReactJson
            name={null}
            src={JSON.parse(reactTask.dump)}
            displayDataTypes={false}
            theme={mode === COLOUR_MODES.dark ? 'summerfruit' : 'summerfruit:inverted'}
            collapsed={1}
          />
          {reactTask.dumpUploadMethod && (
            <Typography>Upload method: {reactTask.dumpUploadMethod.toUpperCase()}</Typography>
          )}
          {reactTask.dumpUploadUrl && <Typography>Upload URL: {reactTask.dumpUploadUrl}</Typography>}
        </Stack>
      )}
    </>
  );
}

ReactTaskPreview.propTypes = {
  task: shape({
    reactTask: object.isRequired
  }).isRequired
};

export default ReactTaskPreview;