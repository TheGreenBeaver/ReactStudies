import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link, Redirect, useHistory, useLocation } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import links from '../links';
import { useSelector } from 'react-redux';
import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import { useCallback, useMemo } from 'react';
import { parse } from 'query-string';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Pagination from '@mui/material/Pagination';


function TaskListContent({ page, pageSize: providedPageSize, q }) {
  const { isTeacher } = useSelector(state => state.account.userData);
  const listTasks = useCallback(
    (currentPage, currentPageSize, currentQ) => api.tasks.list({
      params: { page: currentPage, pageSize: currentPageSize, q: currentQ },
    }), [],
  );
  const history = useHistory();
  const [tasksData, isProcessing] = useFetch(listTasks, {
    deps: [page, providedPageSize, q],
    initialData: { results: [], next: null, previous: null, count: 0 },
    shouldFetch: page => !!page
  });
  const pageSize = providedPageSize || 30;
  return (
    <>
      {
        isTeacher &&
        <Box display='flex' alignItems='center' justifyContent='end'>
          <Button startIcon={<Add />} component={Link} to={links.createTask.path}>
            Create new
          </Button>
        </Box>
      }
      <List>
        {tasksData.results.map(task =>
          <ListItem key={task.id} component={Link} to={links.singleTask.compose(task.id)}>
            {task.title}
          </ListItem>,
        )}
      </List>
      <Pagination
        page={page}
        onChange={(_, newPage) =>
          history.push(links.taskList.compose({ page: newPage }))
        }
        count={Math.ceil(tasksData.count / pageSize)}
      />
    </>
  )
}

function TaskList() {
  const { search } = useLocation();
  const { page, pageSize, q } = useMemo(() => parse(search), [search]);
  if (!page || (typeof page !== 'number' && !/^\d+$/.test(page))) {
    return <Redirect to={links.taskList.compose({ page: 1 })} />;
  }
  return <TaskListContent page={+page} pageSize={pageSize} q={q} />
}

export default TaskList;
