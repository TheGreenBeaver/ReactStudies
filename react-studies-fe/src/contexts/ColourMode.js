import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { node } from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getUpd } from '../util/misc';
import { COLOUR_MODES } from '../util/constants';


const DEFAULT_MODE = COLOUR_MODES.light;

const AS_IN_SYSTEM_KEY = 'fsColourAsInSystem';
const AS_IN_SYSTEM_VALUE = 'true';

function getStoredAsInSystem() {
  return localStorage.getItem(AS_IN_SYSTEM_KEY) === AS_IN_SYSTEM_VALUE;
}

function rememberAsInSystem(asInSystem) {
  if (asInSystem) {
    localStorage.setItem(AS_IN_SYSTEM_KEY, AS_IN_SYSTEM_VALUE);
  } else {
    localStorage.removeItem(AS_IN_SYSTEM_KEY);
  }
}

const MODE_KEY = 'fsColourMode';

function getStoredMode() {
  const storedMode = localStorage.getItem(MODE_KEY);
  return storedMode in COLOUR_MODES ? storedMode : DEFAULT_MODE;
}

function rememberMode(mode) {
  if (mode in COLOUR_MODES) {
    localStorage.setItem(MODE_KEY, mode);
    return true;
  }
}

const ColourModeContext = createContext({
  mode: COLOUR_MODES.light,
  asInSystem: true,
  setMode: () => {},
  setAsInSystem: () => {}
});

function useColourMode() {
  return useContext(ColourModeContext);
}

function ColourModeProvider({ children }) {
  const [mode, setMode] = useState(getStoredMode);
  const [asInSystem, setAsInSystem] = useState(getStoredAsInSystem)
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    if (asInSystem) {
      setMode(prefersDarkMode ? COLOUR_MODES.dark : COLOUR_MODES.light);
    }
  }, [prefersDarkMode, asInSystem]);

  useEffect(() => {
    document.body.style.setProperty('background-color', mode === COLOUR_MODES.dark ? '#121212' : 'white');
  }, [mode]);

  function changeAsInSystem(upd) {
    setAsInSystem(curr => {
      const newAsInSystem = getUpd(upd, curr);
      rememberAsInSystem(newAsInSystem);
      return newAsInSystem;
    });
  }

  function changeMode(upd) {
    setMode(curr => {
      const newMode = getUpd(upd, curr);
      return rememberMode(newMode) ? newMode : curr;
    });
    changeAsInSystem(false);
  }

  const contextValue = useMemo(() => ({
    mode, asInSystem,
    setMode: changeMode,
    setAsInSystem: changeAsInSystem
  }), [mode, asInSystem]);

  return (
    <ColourModeContext.Provider value={contextValue}>
      {children}
    </ColourModeContext.Provider>
  )
}

ColourModeProvider.propTypes = {
  children: node.isRequired,
};

export default useColourMode;
export { ColourModeProvider };