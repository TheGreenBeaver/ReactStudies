import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usersService from '../../../api/users';
import { useDispatch } from 'react-redux';
import { setIsVerified } from '../../../store/actions/account';


const REQUESTING = 'Requesting';

function Verify() {
  const dispatch = useDispatch();
  const { uid, token } = useParams();
  const [verificationState, setVerificationState] = useState(REQUESTING)

  useEffect(() => {
    const requestVerification = async () => {
      setVerificationState(REQUESTING);
      try {
        const response = await usersService.verify(uid, token);
        dispatch(setIsVerified(response.data.isVerified));
      } catch (e) {
        setVerificationState(e.response.data.nonFieldErrors[0]);
      }
    };

    requestVerification();
  }, [uid, token]);

  return (
    <div>{verificationState}</div>
  );
}

export default Verify;