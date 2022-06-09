import Typography from '@mui/material/Typography';
import withCache from '../../../hofs/withCache';
import api from '../../../api';
import { Link, useHistory } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import { number } from 'prop-types';
import { DEFAULT_PAGINATED_DATA } from '../../../util/constants';
import StrictAccordion from '../../../uiKit/StrictAccordion';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import links from '../links';
import withQueryParams from '../../../hocs/withQueryParams';
import SmartForm from '../../../uiKit/SmartForm';
import { Form } from 'formik';
import Grid from '@mui/material/Grid';
import EntityAutocompleteField from '../../../uiKit/SmartForm/fields/EntityAutocompleteField';
import SubmitButton from '../../../uiKit/SmartForm/interactions/SubmitButton';
import pickBy from 'lodash/pickBy';
import List from '@mui/material/List';
import Preloader from '../../../uiKit/Preloader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  cleanupPaginationParams,
  getSolutionResultIndicator,
  isPositiveInt,
} from '../../../util/misc';
import ListItemText from '@mui/material/ListItemText';
import { DateTime } from 'luxon';
import Pagination from '@mui/material/Pagination';
import pick from 'lodash/pick';


const listSolutions = withCache((page, pageSize, taskId) => api.solutions.list({
  params: { page, pageSize, taskId }
}));

function SolutionsList({ page, pageSize, taskId }) {
  const history = useHistory();
  const [solutionsData, isFetching, error] = useFetch(listSolutions, {
    deps: [page, pageSize, taskId],
    initialData: DEFAULT_PAGINATED_DATA,
    shouldFetch: (currentPage, currentPageSize) => !!(currentPage && currentPageSize)
  });

  return (
    <>
      <Typography variant='h4' mb={1}>My solutions</Typography>
      <StrictAccordion
        summary={
          <Box
            display='flex'
            justifyContent='space-between'
            width='100%'
            alignItems='center'
          >
            <Typography>Filter solutions</Typography>
          </Box>
        }
        ExpandIcon={FilterAltOutlined}
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <SmartForm
          initialValues={{ taskId: taskId || null }}
          onSubmit={(values, { setSubmitting }) => {
            history.push(links.solutionsList.compose({
              page: 1, pageSize, ...pickBy(values, v => !!v)
            }));
            setSubmitting(false);
          }}
          doNotPopulate
          noSubmitLogic
        >
          {({ setValues, submitForm }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <EntityAutocompleteField
                    name='taskId'
                    service={api.tasks}
                    label='Task'
                    margin='none'
                    getOptionLabel={task => task.title}
                    renderOption={(props, task) => (
                      <Box {...{ ...props, key: task.id }} display='block !important'>
                        <Typography>{task.title}</Typography>
                        <Typography display='block' variant='caption' color='text.secondary'>
                          (Upd. {DateTime.fromISO(task.updatedAt).toFormat('f')})
                        </Typography>
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <SubmitButton fullWidth type='submit'>Apply filters</SubmitButton>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => {
                      setValues({ taskId: null });
                      submitForm();
                    }}
                  >
                    Clear filters
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </SmartForm>
      </StrictAccordion>
      <List sx={{ flex: 1 }}>
        {
          isFetching
            ? <Preloader size={80} />
            : (!error && solutionsData.results.map(solution =>
              <ListItem key={solution.id} divider>
                <ListItemButton
                  component={Link}
                  to={links.singleSolution.compose(solution.id)}
                >
                  <ListItemIcon>{getSolutionResultIndicator(solution.results?.[0])}</ListItemIcon>
                  <ListItemText
                    primary={solution.results?.[0]
                      ? `Last submit: ${DateTime.fromISO(solution.results[0].createdAt).toFormat('f')}`
                      : <i>No attempts yet</i>
                    }
                    secondary={`Last update ${DateTime.fromISO(solution.updatedAt).toFormat('f')}`}
                  />
                </ListItemButton>
              </ListItem>,
            ))
        }
      </List>
      <Pagination
        sx={{ pt: 1 }}
        page={page}
        onChange={(_, newPage) =>
          history.push(links.solutionsList.compose({ page: newPage, pageSize, taskId }))
        }
        count={Math.ceil(solutionsData.count / pageSize)}
      />
    </>
  );
}

SolutionsList.propTypes = {
  page: number.isRequired,
  pageSize: number.isRequired,
  taskId: number
};

function cleanup(params) {
  const cleanParams = pick(params, 'taskId');

  if (!isPositiveInt(cleanParams.taskId)) {
    delete cleanParams.taskId;
  }

  Object.assign(cleanParams, cleanupPaginationParams(params));

  return cleanParams;
}

export default withQueryParams(SolutionsList, links.solutionsList, cleanup);
