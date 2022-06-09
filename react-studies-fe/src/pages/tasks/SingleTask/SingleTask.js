import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import { Link, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGINATED_DATA, TASK_KIND_ICONS, TASK_KINDS } from '../../../util/constants';
import LoadingPage from '../../../components/LoadingPage';
import React, { useCallback, useMemo, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import SuggestSolution from './SuggestSolution';
import tabs from './tabs';
import Markdown from '../../../uiKit/Markdown';
import Button from '@mui/material/Button';
import Edit from '@mui/icons-material/Edit';
import Stack from '@mui/material/Stack';
import LayoutTaskPreview from './LayoutTaskPreview';
import MuiLink from '@mui/material/Link'
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { DateTime } from 'luxon';
import { getSolutionResultIndicator, getTaskKind } from '../../../util/misc';
import links from '../../config/links';
import useWsAction from '../../../hooks/useWsAction';
import WsWithQueue from '../../../ws/ws-with-queue';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import usePromise from '../../../hooks/usePromise';
import withCache from '../../../hofs/withCache';
import Layout from '../../../uiKit/Layout';
import Preloader from '../../../uiKit/Preloader';


function taskNeedsStudentInput(task, taskKind) {
  switch (taskKind) {
    case TASK_KINDS.layout:
      return false;
    case TASK_KINDS.react:
      const needsDumpLogic = !!task.dump && (!task.dumpUploadUrl || !task.dumpUploadMethod);
      const needsAuthLogic = !!task.authTemplate && (
        !task.authTemplate.routes ||
        !task.authTemplate.endpoints ||
        task.authTemplate.hasVerification && task.authTemplate.endpoints.length !== 3 || !task.authTemplate.special
      );
      const needsListLogic = !!task.entityListTemplate && (
        !task.entityListTemplate.endpoints ||
        !task.entityListTemplate.routes ||
        task.entityListTemplate.hasSearch && !task.entityListTemplate.special
      );
      const needsSingleLogic = !!task.singleEntityTemplate && (
        !task.singleEntityTemplate.endpoints ||
        !task.singleEntityTemplate.routes
      );
      return needsDumpLogic || needsAuthLogic || needsListLogic || needsSingleLogic;
    default:
      return false;
  }
}

const TASK_PREVIEWS = {
  [TASK_KINDS.layout]: LayoutTaskPreview,
  [TASK_KINDS.react]: () => 'REACT'
};

const TASK_EXPLANATIONS = {
  [TASK_KINDS.layout]: 'Use HTML and a stylesheet language (CSS, SASS etc.) to create a layout matching the mockup.',
  [TASK_KINDS.react]: 'Use JavaScript and React to create a fully functional Web Application integrated with a REST Backend.'
};

function getData(fresh, curr) {
  return { ...curr, ...fresh.data, results: [...curr.results, ...fresh.data.results] };
}

function SingleTask() {
  const { isTeacher, id: currentUserId } = useSelector(state => state.account.userData);
  const { id } = useParams();
  const [task, isFetchingTask] = useFetch(api.tasks.retrieve, {
    deps: [id], initialData: null,
  });

  const listSolutions = useCallback(
    withCache(page => api.solutions.list({ params: { page, taskId: id } })), [id]
  )
  const {
    handler: fetchSolutions,
    isProcessing: isFetchingSolutions,
    data: solutionsData
  } = usePromise(listSolutions, {
    initialData: DEFAULT_PAGINATED_DATA, getData
  });
  const [solutionsBoxProps] = useInfiniteScroll(
    fetchSolutions, !isFetchingSolutions && solutionsData.next != null, {
      initialLoad: true, threshold: 80
    }
  );

  const [freshResults, setFreshResults] = useState([]);
  useWsAction(WsWithQueue.Actions.workflowResultsReady, ({ solution, result }) =>
    setFreshResults(curr => {
      const newData = [...curr];
      const idx = newData.findIndex(entry => entry.id === solution.id);
      if (idx !== -1) {
        newData[idx].results[0] = result;
      } else {
        newData.push({ ...solution, results: [result], student: { id: currentUserId } })
      }
      return newData;
    })
  );

  const allSolutions = useMemo(() => {
    const solutionsList = [...solutionsData.results];
    freshResults.forEach(res => {
      const idx = solutionsList.findIndex(solution => solution.id === res.id);
      if (idx !== -1) {
        solutionsList.splice(idx, 1, res);
      } else {
        solutionsList.unshift(res);
      }
    });
    return solutionsList;
  }, [freshResults, solutionsData]);

  const [isConfiguringSolution, setIsConfiguringSolution] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabs.task);

  const taskKind = useMemo(() => getTaskKind(task), [task]);

  const attachmentsData = useMemo(() => {
    if (!task) {
      return {};
    }
    const localFiles = [];
    const localFilesRefs = [];
    task.attachments?.forEach(({ refName, ...fileData }) => {
      localFiles.push(fileData);
      localFilesRefs.push(refName);
    });
    return { localFilesRefs, localFiles };
  }, [task]);

  if (isFetchingTask) {
    return <LoadingPage />;
  }

  const Preview = TASK_PREVIEWS[taskKind];

  return (
    <TabContext value={currentTab}>
      <Box display='flex' alignItems='center' mb={2} columnGap={4} justifyContent='space-between'>
        <Box display='flex' alignItems='center' columnGap={2}>
          {TASK_KIND_ICONS[taskKind]}<Typography variant='h4'>{task.title}</Typography>
        </Box>

        {isTeacher ? (
          <Button
            component={Link}
            to={links.tasks.editTask.compose(id)}
            startIcon={<Edit />}
            variant='outlined'
          >
            Edit
          </Button>
        ) : (
          <SuggestSolution
            isConfiguringSolution={isConfiguringSolution}
            taskId={task.id}
            studentInputNeeded={taskNeedsStudentInput(task, taskKind)}
            setIsConfiguringSolution={setIsConfiguringSolution}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        )}
      </Box>

      <TabPanel
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 0, pb: 0 }}
        value={tabs.task}
      >
        <Box flex={1}>
          <Stack spacing={3}>
            <Typography>{TASK_EXPLANATIONS[taskKind]}</Typography>
            {isTeacher && (
              <Typography>
                Link to repository: <MuiLink href={task.repoUrl} rel='noopener noreferrer' target='_blank'>{task.repoUrl}</MuiLink>
              </Typography>
            )}
            {!!task.description && (
              <Box>
                <Typography variant='h6'>Extra notes</Typography>
                <Markdown
                  source={task.description}
                  {...attachmentsData}
                  label='Description'
                />
              </Box>
            )}
            <Preview task={task} />
          </Stack>
        </Box>

        <Box mt={4}>
          <Typography variant='h5' mb={1}>Solutions</Typography>
          {allSolutions.length ? (
            <List sx={{ height: 200, overflowY: 'auto' }} disablePadding {...solutionsBoxProps}>
              {allSolutions.map(({ id: solutionId, results, student }) => (
                <ListItem key={solutionId} divider>
                  <ListItemButton
                    component={Link}
                    to={links.solutions.singleSolution.compose(solutionId, {
                      pageSize: DEFAULT_PAGE_SIZE, resultsPage: 1
                    })}
                  >
                    <ListItemIcon>{getSolutionResultIndicator(results[0])}</ListItemIcon>
                    <ListItemText
                      primary={`Author: ${student.id === currentUserId ? 'You' : `${student.firstName} ${student.lastName}`}`}
                      secondary={results[0]
                        ? <>Last submit {DateTime.fromISO(results[0].createdAt).toFormat('f')}</>
                        : 'No submits yet'
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            !isFetchingSolutions && <Typography component='i'>No solutions yet</Typography>
          )}
          {isFetchingSolutions && <Layout.Center height='1.5em' mt={1}><Preloader size='1.5em' /></Layout.Center>}
        </Box>
      </TabPanel>

      {isConfiguringSolution && (
        <TabPanel
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 0, pb: 0 }}
          value={tabs.solution}
        >
          Student Input
        </TabPanel>
      )}

    </TabContext>
  );
}

export default SingleTask;
