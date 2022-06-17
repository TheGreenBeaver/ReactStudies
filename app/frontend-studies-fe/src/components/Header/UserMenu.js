import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useDispatch, useSelector } from 'react-redux';
import usePopover from '../../hooks/usePopover';
import api from '../../api';
import { logOut } from '../../store/slices/account';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import links from '../../pages/config/links';
import { DEFAULT_PAGE_SIZE } from '../../util/constants';


function UserMenu() {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.account);
  const { closeMenu, popoverProps, triggerProps } = usePopover();

  function onLogOutClick() {
    closeMenu();
    api.auth.logOut().then(() => dispatch(logOut()));
  }

  return (
    <>
      <Typography sx={{ cursor: 'pointer' }} {...triggerProps}>
        Logged in as <b>{userData.firstName} {userData.lastName}</b>
      </Typography>

      <Menu
        sx={{ mt: 1 }}
        MenuListProps={{ sx: { minWidth: 220 } }}
        {...popoverProps}
      >
        {!userData.isTeacher && userData.isVerified && (
          <MenuItem
            onClick={closeMenu}
            component={Link}
            to={links.solutions.solutionsList.compose({ page: 1, pageSize: DEFAULT_PAGE_SIZE })}
          >
            My solutions
          </MenuItem>
        )}
        <MenuItem onClick={onLogOutClick}>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

export default UserMenu;