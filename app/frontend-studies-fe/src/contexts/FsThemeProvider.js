import { node } from 'prop-types';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import useColourMode from './ColourMode';
import { useMemo } from 'react';
import getTheme from '../theme';


function FsThemeProvider({ children }) {
  const { mode } = useColourMode();
  const theme = useMemo(() => getTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

FsThemeProvider.propTypes = {
  children: node.isRequired,
};

export default FsThemeProvider;