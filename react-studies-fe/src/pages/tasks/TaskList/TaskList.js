import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import links from '../links';
import { useSelector } from 'react-redux';


function TaskList() {
  const { isTeacher } = useSelector(state => state.account.userData);
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
    </>
  )
}

export default TaskList;
