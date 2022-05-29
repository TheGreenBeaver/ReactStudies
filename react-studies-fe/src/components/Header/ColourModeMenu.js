import useColourMode from '../../contexts/ColourMode';
import usePopover from '../../hooks/usePopover';
import Button from '@mui/material/Button';
import { COLOUR_MODES } from '../../util/constants';
import { DarkMode, LightMode, Contrast } from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import startCase from 'lodash/startCase';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';


const MODE_ICONS = {
  [COLOUR_MODES.dark]: <DarkMode />,
  [COLOUR_MODES.light]: <LightMode />
};

function ColourModeMenu() {
  const { mode, setMode, asInSystem, setAsInSystem } = useColourMode();
  const { closeMenu, popoverProps, triggerProps } = usePopover();

  function getIcon() {
    return asInSystem ? <Contrast /> : MODE_ICONS[mode];
  }

  return (
    <>
      <Button sx={{ color: 'common.white' }} {...triggerProps} variant='text' startIcon={getIcon()}>
        Theme
      </Button>

      <Menu sx={{ mt: 1 }}{...popoverProps}>
        {
          Object.values(COLOUR_MODES).map(colourMode =>
            <MenuItem
              key={colourMode}
              onClick={() => {
                setMode(colourMode);
                closeMenu();
              }}
              selected={!asInSystem && mode === colourMode}
            >
              <ListItemIcon>{MODE_ICONS[colourMode]}</ListItemIcon>
              <ListItemText>{startCase(colourMode)}</ListItemText>
            </MenuItem>
          )
        }
        <MenuItem
          key='asInSystem'
          onClick={() => {
            setAsInSystem(true);
            closeMenu();
          }}
          selected={asInSystem}
        >
          <ListItemIcon><Contrast/></ListItemIcon>
          <ListItemText>System default</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default ColourModeMenu;