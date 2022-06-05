import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SolutionIdea from '../../../assets/icons/SolutionIdea';
import { TASK_KIND_ICONS, TASK_KINDS } from '../../../util/constants';
import LoadingPage from '../../../components/LoadingPage';
import React, { useState } from 'react';
import usePromise from '../../../hooks/usePromise';
import Preloader from '../../../uiKit/Preloader';


function taskNeedsStudentInput(task) {
  switch (task.kind) {
    case TASK_KINDS.layout:
      return false;
    case TASK_KINDS.react:
      return task.pages.some(page => !page.endpoints || !page.routes);
    default:
      return false;
  }
}

function SingleTask() {
  const { isTeacher } = useSelector(state => state.account.userData);
  const { id } = useParams();
  const [task, isFetchingTask] = useFetch(api.tasks.retrieve, {
    deps: [id], initialData: null
  });
  const { handler: createSolution, isProcessing: isCreatingSolution } = usePromise(api.solutions.create);
  const [studentInputModalsOpen, setStudentInputModalsOpen] = useState({ [TASK_KINDS.react]: false });

  if (isFetchingTask) {
    return <LoadingPage />;
  }

  function onSuggestSolutionClick() {
    if (!taskNeedsStudentInput(task)) {
      return createSolution({ taskId: task.id })
    }

    setStudentInputModalsOpen(curr => ({ ...curr, [task.kind]: true }));
  }

  const KindIcon = TASK_KIND_ICONS[task.kind];
  return (
    <>
      <Box display='flex' alignItems='center' mb={2} columnGap={4} justifyContent='space-between'>
        <Box display='flex' alignItems='center' columnGap={2}>
          <KindIcon /><Typography variant='h4'>{task.title}</Typography>
        </Box>

        {
          !isTeacher &&
          <Button
            disabled={isCreatingSolution}
            variant='contained'
            sx={{ display: 'flex', columnGap: 1 }}
            onClick={onSuggestSolutionClick}
            startIcon={<SolutionIdea />}
          >
            {isCreatingSolution && <Preloader size='1em' />}
            Suggest solution
          </Button>
        }
      </Box>
    </>
  );
}

export default SingleTask;
