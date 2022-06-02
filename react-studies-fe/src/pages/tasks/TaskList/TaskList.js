import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link, useHistory } from 'react-router-dom';
import Add from '@mui/icons-material/Add';
import links from '../links';
import { useSelector } from 'react-redux';
import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Pagination from '@mui/material/Pagination';
import { number, oneOfType, string } from 'prop-types';
import withQueryParams from '../../../hocs/withQueryParams';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { DEFAULT_PAGINATED_DATA, TASK_KIND_DEFINITIONS, TASK_KIND_ICONS } from '../../../util/constants';
import Preloader from '../../../uiKit/Preloader';
import ListItemButton from '@mui/material/ListItemButton';
import { cleanupPaginationParams, cleanupTaskKindParams, getOptions, isPositiveInt } from '../../../util/misc';
import { TaskKind } from '../../../util/types';
import pick from 'lodash/pick';
import StrictAccordion from '../../../uiKit/StrictAccordion';
import Typography from '@mui/material/Typography';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import SmartForm from '../../../uiKit/SmartForm';
import pickBy from 'lodash/pickBy';
import Grid from '@mui/material/Grid';
import { Form } from 'formik';
import StandardTextField from '../../../uiKit/SmartForm/fields/StandardTextField';
import StandardSelectField from '../../../uiKit/SmartForm/fields/StandardSelectField';
import withCache from '../../../hofs/withCache';
import UsersAutocompleteField from '../../../uiKit/SmartForm/fields/UsersAutocompleteField';
import SubmitButton from '../../../uiKit/SmartForm/interactions/SubmitButton';


const taskKindOptions = getOptions(TASK_KIND_DEFINITIONS, 'Any');
const listTasks = withCache((page, pageSize, q, kind, teacherId) => api.tasks.list({
  params: { page, pageSize, q, kind, teacherId },
}));

function TaskList({ page, pageSize, q, kind, teacherId }) {
  const { isTeacher } = useSelector(state => state.account.userData);
  const history = useHistory();

  const [tasksData, isProcessing] = useFetch(listTasks, {
    deps: [page, pageSize, q, kind, teacherId],
    initialData: DEFAULT_PAGINATED_DATA,
    shouldFetch: (currentPage, currentPageSize) => !!(currentPage && currentPageSize)
  });

  return (
    <>
      <StrictAccordion
        summary={
          <Box
            display='flex'
            justifyContent='space-between'
            width='100%'
            alignItems='center'
          >
            <Typography>Filter tasks</Typography>
            {
              isTeacher &&
              <Button startIcon={<Add />} component={Link} to={links.createTask.path}>
                Create new
              </Button>
            }
          </Box>
        }
        ExpandIcon={FilterAltOutlined}
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <SmartForm
          initialValues={{ q: q || '', teacherId: teacherId || null, kind: kind || '' }}
          onSubmit={(values, { setSubmitting }) => {
            history.push(links.taskList.compose({
              page: 1, pageSize, ...pickBy(values, v => !!v)
            }));
            setSubmitting(false);
          }}
          doNotPopulate
          noSubmitLogic
        >
          {
            ({ setValues, submitForm }) =>
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <StandardTextField name='q' label='Task title' autoComplete='false' />
                  </Grid>
                  <Grid item xs={4}>
                    <StandardSelectField
                      name='kind'
                      options={taskKindOptions}
                      label='Task type'
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <UsersAutocompleteField name='teacherId' isTeacher label='Task author' />
                  </Grid>
                  <Grid item xs={2}>
                    <SubmitButton fullWidth type='submit'>Apply filters</SubmitButton>
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => {
                        setValues({ q: '', teacherId: null, kind: '' });
                        submitForm();
                      }}
                    >
                      Clear filters
                    </Button>
                  </Grid>
                </Grid>
              </Form>
          }
        </SmartForm>
      </StrictAccordion>
      <List sx={{ flex: 1 }}>
        {
          isProcessing
            ? <Preloader size={80} />
            : tasksData.results.map(task => {
              const Icon = TASK_KIND_ICONS[task.kind];
              return (
                <ListItem key={task.id}>
                  <ListItemButton
                    component={Link}
                    to={links.singleTask.compose(task.id)}
                  >
                    <ListItemIcon><Icon /></ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={`By ${task.teacher.firstName} ${task.teacher.lastName}`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
        }
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

TaskList.propTypes = {
  page: number.isRequired,
  pageSize: number.isRequired,
  q: oneOfType([string, number]),
  teacherId: number,
  kind: TaskKind
};

function cleanup(params) {
  const cleanParams = pick(params, ['teacherId', 'q']);

  if (!isPositiveInt(cleanParams.teacherId)) {
    delete cleanParams.teacherId;
  }

  Object.assign(cleanParams, cleanupPaginationParams(params));
  Object.assign(cleanParams, cleanupTaskKindParams(params));

  return cleanParams;
}

export default withQueryParams(TaskList, links.taskList, cleanup);
