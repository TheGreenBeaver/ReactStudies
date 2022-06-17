import { number, bool, func, oneOf } from 'prop-types';
import SmartForm from '../../../uiKit/SmartForm';
import GitHubTokenField from '../../../uiKit/SmartForm/fields/GitHubTokenField';
import { TOKEN_FIELDS } from '../../../util/constants';
import api from '../../../api';
import { useHistory } from 'react-router-dom';
import links from '../../config/links';
import Button from '@mui/material/Button';
import SolutionIdea from '../../../assets/icons/SolutionIdea';
import Box from '@mui/material/Box';
import TabList from '@mui/lab/TabList';
import tabs from './tabs';
import Tab from '@mui/material/Tab';
import Close from '@mui/icons-material/Close'
import styled from '@mui/material/styles/styled';
import useAlert from '../../../hooks/useAlert';
import Validators from '../../../util/validation';


const ButtonTab = styled(Tab)(({ theme }) => ({
  padding: '5px 15px',
  minHeight: 'unset',
  lineHeight: 1.75,

  '&:first-of-type': {
    borderRight: `1px solid ${theme.palette.primary.main}80`,
  },
  '&.Mui-selected': {
    background: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)'
  }
}));

function SuggestSolution({
  taskId,
  studentInputNeeded,
  isConfiguringSolution,
  setIsConfiguringSolution,
  setCurrentTab,
}) {
  const history = useHistory();
  const showAlert = useAlert();

  if (!studentInputNeeded) {
    return (
      <SmartForm
        initialValues={{
          [TOKEN_FIELDS.gitHubToken]: '',
          [TOKEN_FIELDS.rememberToken]: true,
        }}
        onSubmit={values => api.solutions
          .create({ ...values, taskId })
          .then(({ data }) => {
            showAlert('Solution created, the repository will be ready soon', 'success');
            history.push(links.solutions.singleSolution.compose(data.id))
          })
        }
        validationSchema={{
          [TOKEN_FIELDS.gitHubToken]: Validators.gitHubToken(true),
        }}
        doNotPopulate
      >
        <GitHubTokenField
          startIcon={<SolutionIdea />}
          action='create'
          entity='solution'
          buttonText='Suggest solution'
        />
      </SmartForm>
    );
  }

  function handleTabChange(_, newTab) {
    setCurrentTab(newTab);
  }

  return (
    <Box display='flex' alignItems='center' gap={2}>
      <TabList
        onChange={handleTabChange}
        sx={{
          visibility: isConfiguringSolution ? 'visible' : 'hidden',
          minHeight: 'unset',
          border: theme => `1px solid ${theme.palette.primary.main}80`,
          borderRadius: '4px',

          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}
      >
        <ButtonTab value={tabs.task} label='Task preview' />
        <ButtonTab value={tabs.solution} label='New solution' />
      </TabList>

      <Button
        variant={isConfiguringSolution ? 'outlined' : 'contained'}
        startIcon={isConfiguringSolution ? <Close /> : <SolutionIdea />}
        onClick={() => {
          setIsConfiguringSolution(curr => !curr);
          setCurrentTab(isConfiguringSolution ? tabs.task : tabs.solution);
        }}
      >
        {isConfiguringSolution ? 'Cancel' : 'Suggest solution'}
      </Button>
    </Box>
  );
}

SuggestSolution.propTypes = {
  taskId: number.isRequired,
  studentInputNeeded: bool.isRequired,
  setIsConfiguringSolution: func.isRequired,
  isConfiguringSolution: bool.isRequired,
  currentTab: oneOf([...Object.values(tabs)]).isRequired,
  setCurrentTab: func.isRequired
};

export default SuggestSolution;