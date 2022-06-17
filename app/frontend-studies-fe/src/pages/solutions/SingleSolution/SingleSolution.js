import { useHistory, useParams } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import LoadingPage from '../../../components/LoadingPage';
import Typography from '@mui/material/Typography';
import StyledLink from '../../../uiKit/StyledLink';
import links from '../../config/links';
import { useCallback, useMemo, useState } from 'react';
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
import useWsAction from '../../../hooks/useWsAction';
import WsWithQueue from '../../../ws/ws-with-queue';
import { useUserState } from '../../../store/selectors';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import LayoutResultDetails from './LayoutResultDetails';
import Stack from '@mui/material/Stack';


const retrieveResult = withCache(api.solutionResults.retrieve);

const INSTRUCTIONS = {
  [TASK_KINDS.layout]: [
    <>
      Put your work in the <Layout.Code>./src</Layout.Code> directory. Any changes within it pushed to{' '}
      <Layout.Code>main</Layout.Code> branch will trigger the test workflow.
    </>,
    <>
      If you need to use files from <Layout.Code>./attachments</Layout.Code>, you'll need to copy them to{' '}
      <Layout.Code>./src</Layout.Code> first and access from there - otherwise the static server won't find them.
    </>,
    <>
      You can run the tests locally. For that, install{' '}
      <MuiLink href='https://nodejs.org/en/download/releases/'>Node.js v.16.13.1</MuiLink> and{' '}
      <MuiLink href='https://yarnpkg.com/getting-started/migration#step-by-step'>Yarn v.3.2.0</MuiLink>,
      then run <Layout.Code component='code'>yarn install</Layout.Code> and{' '}
      <Layout.Code component='code'>yarn test</Layout.Code> in the project root.
    </>
  ],
  [TASK_KINDS.react]: [
    <>
      Put your work in the <Layout.Code>./app-frontend</Layout.Code> and <Layout.Code>./app-backend</Layout.Code>{' '}
      directories. Any changes within these pushed to <Layout.Code>main</Layout.Code> branch will
      trigger the test workflow.
    </>,
  ]
};

const RESULT_DETAILS = {
  [TASK_KINDS.layout]: LayoutResultDetails,
  [TASK_KINDS.react]: () => 'results'
};

function SingleSolution({ resultsPage, pageSize }) {
  const { id } = useParams();
  const history = useHistory();
  const { isTeacher } = useUserState();
  const [solution, isFetchingSolution] = useFetch(api.solutions.retrieve, {
    deps: [id], initialData: null
  });
  const [currentExploredResultId, setCurrentExploredResultId] = useState(null);
  const [currentExploredResult, isFetchingCurrentExploredResult] = useFetch(retrieveResult, {
    deps: [currentExploredResultId], initialData: null
  });

  const listResults = useCallback(withCache((page, pageSize) => api.solutionResults.list({
    params: { page, pageSize, solutionId: id }
  })), [id]);

  const [resultsData, isFetchingResults] = useFetch(listResults, {
    deps: [resultsPage, pageSize], initialData: DEFAULT_PAGINATED_DATA,
  });

  const [freshResults, setFreshResults] = useState([]);
  useWsAction(WsWithQueue.Actions.workflowResultsReady, ({ solution, result }) => {
    if (solution.id !== +id) {
      return;
    }
    setFreshResults(curr => {
      const newData = [...curr];
      const idx = newData.findIndex(entry => entry.id === result.id);
      if (idx !== -1) {
        newData.splice(1, idx, result);
      } else {
        newData.push(result);
      }
      return newData;
    })
  });

  const allResults = useMemo(() => {
    const resultsList = [...resultsData.results];
    freshResults.forEach(freshRes => {
      const idx = resultsList.findIndex(res => res.id === freshRes.id);
      if (idx !== -1) {
        resultsList.splice(idx, 1, freshRes);
      } else {
        resultsList.unshift(freshRes);
      }
    });
    return resultsList.slice(0, pageSize);
  }, [freshResults, resultsData]);

  const taskKind = useMemo(() => getTaskKind(solution?.task), [solution]);

  if (isFetchingSolution) {
    return <LoadingPage />;
  }

  const DetailsComponent = RESULT_DETAILS[taskKind];

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
      <Dialog
        keepMounted={false}
        open={currentExploredResultId != null}
        onClose={() => setCurrentExploredResultId(null)}
        maxWidth='lg'
      >
        <DialogTitle>
          Result details
        </DialogTitle>
        <DialogContent>
          {isFetchingCurrentExploredResult || !currentExploredResult ? (
            <Preloader size='2em' />
          ) : (
            <Stack direction='column' spacing={1}>
              <Box display='flex' alignItems='center' columnGap={0.5}>
                <Typography>Summary:</Typography>
                {getSolutionResultIndicator(currentExploredResult, true)}
                <Typography>
                  {currentExploredResult.summary}
                </Typography>
              </Box>
              <DetailsComponent result={currentExploredResult} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurrentExploredResultId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Typography variant='h5' mt={2}>Results</Typography>
      <List sx={{ flex: 1 }}>
        {isFetchingResults && <Layout.Center height='2em'><Preloader size='2em' /></Layout.Center>}
        {allResults.length ? (
          allResults.map(result => (
            <ListItem key={result.id} divider>
              <ListItemButton onClick={() => setCurrentExploredResultId(result.id)}>
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
