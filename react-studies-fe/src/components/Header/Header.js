import React from '.';
import StyledLink from '../../uiKit/StyledLink';
import { useUserState } from '../../store/selectors';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { getDefaultPath } from '../../pages/config/links';
import UserMenu from './UserMenu';
import ColourModeMenu from './ColourModeMenu';


function Header() {
  const userState = useUserState();
  // TODO: Logo
  return (
    <AppBar>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <StyledLink to={getDefaultPath(userState)} sx={{ width: 120, color: 'common.white' }}>
          Frontend Studies
        </StyledLink>
        <Box display='flex' alignItems='center' columnGap={1}>
          <ColourModeMenu />
          {userState.isAuthorized && <UserMenu />}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;