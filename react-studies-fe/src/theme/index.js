import createTheme from '@mui/material/styles/createTheme';
import { COLOUR_MODES } from '../util/constants';

function getTheme(mode) {
  return createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 700,
        md: 900,
        lg: 1100,
        xl: 1400
      }
    },
    palette: {
      mode,
      input: {
        standard: mode === COLOUR_MODES.light ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.27)'
      }
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          h6: { fontWeight: 400, marginBottom: 4 }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            marginBottom: 4,
          }
        }
      },
      MuiTabPanel: {
        styleOverrides: {
          root: {
            '&[hidden]': {
              padding: 0,
              flex: 0
            }
          }
        }
      }
    }
  });
}

export default getTheme;