import { useHistory, useParams } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import LoadingPage from '../../../components/LoadingPage';
import Typography from '@mui/material/Typography';
import StyledLink from '../../../uiKit/StyledLink';
import links from '../../config/links';
import { useUserState } from '../../../store/selectors';
import { useCallback, useMemo } from 'react';
import { getSolutionResultIndicator, getTaskKind, isPositiveInt } from '../../../util/misc';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGINATED_DATA, TASK_KIND_ICONS, TASK_KINDS } from '../../../util/constants';
import MuiLink from '@mui/material/Link';
import Box from '@mui/material/Box';
import withQueryParams from '../../../hocs/withQueryParams';
import pick from 'lodash/pick';
import { number } from 'prop-types';
import withCache from '../../../hofs/withCache';
import Pagination from '@mui/material/Pagination';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { DateTime } from 'luxon';
import Layout from '../../../uiKit/Layout';
import Preloader from '../../../uiKit/Preloader';
import Circle from '@mui/icons-material/Circle';


const retrieveResult = withCache(api.solutionResults.retrieve);

const INSTRUCTIONS = {
  [TASK_KINDS.layout]: [
    <>
      Put your work in the <Layout.Code>./src</Layout.Code> directory. Any changes within it pushed to
      <Layout.Code>main</Layout.Code> branch will trigger the test workflow.
    </>,
    <>
      If you need to use files from <Layout.Code>./attachments</Layout.Code>, you'll need to copy them to
      <Layout.Code>./src</Layout.Code> first and access from there - otherwise the static server won't find them.
    </>,
    <>
      You can run the tests locally. For that, install
      <MuiLink href='https://nodejs.org/en/download/releases/'>Node.js v.16.13.1</MuiLink> and
      <MuiLink href='https://yarnpkg.com/getting-started/migration#step-by-step'>Yarn v.3.2.0</MuiLink>,
      then run <Layout.Code component='code'>yarn install</Layout.Code> and
      <Layout.Code component='code'>yarn test</Layout.Code> in the project root.
    </>
  ],
  [TASK_KINDS.react]: [
    <>
      Put your work in the <Layout.Code>./app-frontend</Layout.Code> and <Layout.Code>./app-backend</Layout.Code>
      directories. Any changes within these pushed to <Layout.Code>main</Layout.Code> branch will
      trigger the test workflow.
    </>,
  ]
};

function SingleSolution({ resultsPage, pageSize }) {
  const { id } = useParams();
  const history = useHistory();
  const { isTeacher } = useUserState();
  const [solution, isFetchingSolution] = useFetch(api.solutions.retrieve, {
    deps: [id], initialData: null
  });

  const listResults = useCallback(withCache((page, pageSize) => api.solutionResults.list({
    params: { page, pageSize, solutionId: id }
  })), [id]);

  const [resultsData, isFetchingResults] = useFetch(listResults, {
    deps: [resultsPage, pageSize], initialData: DEFAULT_PAGINATED_DATA,
  });

  const taskKind = useMemo(() => getTaskKind(solution?.task), [solution]);

  if (isFetchingSolution) {
    return <LoadingPage />;
  }

  return (
    <>
      <Box display='flex' alignItems='center' columnGap={2} mb={3}>
        {TASK_KIND_ICONS[taskKind]}
        <Typography variant='h4'>
          Solution for{' '}
          <StyledLink to={links.tasks.singleTask.compose(solution.task.id)}>{solution.task.title}</StyledLink>
        </Typography>
      </Box>
      {isTeacher && <Typography>Author: <b>{solution.student.firstName} {solution.student.lastName}</b></Typography>}
      <Typography>
        Repository link:{' '}
        <MuiLink href={solution.repoUrl}>{solution.repoUrl}</MuiLink>
      </Typography>
      {!isTeacher && (
        <>
          <Typography variant='h6' mt={2}>Instructions</Typography>
          <List disablePadding>
            {INSTRUCTIONS[taskKind].map((advice, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemIcon sx={{ width: 'fit-content', pr: 2, minWidth: 'unset' }}>
                  <Circle sx={{ fontSize: '0.75em' }} />
                </ListItemIcon>
                <ListItemText>{advice}</ListItemText>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Typography variant='h5' mt={2}>Results</Typography>
      <List sx={{ flex: 1 }}>
        {isFetchingResults && <Layout.Center height='2em'><Preloader size='2em' /></Layout.Center>}
        {resultsData.results.length ? (
          resultsData.results.map(result => (
            <ListItem key={result.id} divider>
              <ListItemButton>
                <ListItemIcon>{getSolutionResultIndicator(result)}</ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink href={`${solution.repoUrl}/actions/runs/${result.runId}`}>
                      View at GitHub
                    </MuiLink>
                  }
                  secondary={
                    <>
                      Submitted at: {DateTime.fromISO(result.createdAt).toFormat('f')}
                      {result.unprocessedReportLocation && <> &bull; <b>Report ready, need GitHub Token to process it</b></>}
                    </>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Typography component='i'>No attempts have been committed within this solution yet</Typography>
        )}
      </List>
      <Pagination
        sx={{ pt: 1 }}
        page={resultsPage}
        onChange={(_, newPage) =>
          history.push(links.solutions.singleSolution.compose(id, { resultsPage: newPage, pageSize }))
        }
        count={Math.ceil(resultsData.count / pageSize)}
      />
    </>
  );
}

SingleSolution.propTypes = {
  resultsPage: number.isRequired,
  pageSize: number.isRequired
};

function cleanup(params) {
  const cleanParams = pick(params, ['resultsPage', 'pageSize']);

  if (!isPositiveInt(cleanParams.resultsPage)) {
    cleanParams.resultsPage = 1;
  }
  if (!isPositiveInt(cleanParams.pageSize)) {
    cleanParams.pageSize = DEFAULT_PAGE_SIZE;
  }
  return cleanParams;
}

export default withQueryParams(SingleSolution, links.solutions.singleSolution, cleanup, {
  params: ['id']
});
