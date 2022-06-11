import Box from '@mui/material/Box';
import styled from '@mui/material/styles/styled';


const CodeBox = styled(Box)(({ theme, large }) => ({
  padding: `${theme.spacing(large ? 0.5 : 0.25)} ${theme.spacing(large ? 1 : 0.5)}`,
  borderRadius: '4px',
  background: theme.palette.action.selected,
  border: `1px solid ${theme.palette.divider}`,
  display: 'block',
  whiteSpace: 'pre-wrap',
  tabSize: theme.spacing(2),
  width: large ? '100%' : 'fit-content'
}));

export default CodeBox;