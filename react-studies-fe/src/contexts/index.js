import { node } from 'prop-types';

import { ColourModeProvider } from './ColourMode';

import FsThemeProvider from './FsThemeProvider';

import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';

import { Provider as ReduxProvider } from 'react-redux';
import store from '../store';

import { BrowserRouter as Router } from 'react-router-dom';

import { SnackbarProvider } from 'notistack';


function Contexts({ children }) {
  return (
    <ColourModeProvider>
      <FsThemeProvider>
        <ScopedCssBaseline>
          <ReduxProvider store={store}>
            <Router>
              <SnackbarProvider>
                {children}
              </SnackbarProvider>
            </Router>
          </ReduxProvider>
        </ScopedCssBaseline>
      </FsThemeProvider>
    </ColourModeProvider>
  );
}

Contexts.propTypes = {
  children: node.isRequired,
};

export default Contexts;