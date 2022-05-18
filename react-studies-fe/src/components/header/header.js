import React from 'react';
import authService from '../../api/auth';
import { useDispatch } from 'react-redux';
import { logOut } from '../../store/actions/account';


function Header() {
  const dispatch = useDispatch();
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: 100, height: 50 }}>
      <button
        onClick={() => authService.logOut().then(() => dispatch(logOut()))}
      >
        log out
      </button>
    </div>
  );
}

export default Header;