import { useParams } from 'react-router-dom';
import { useCallback } from 'react';
import api from '../../../api';
import { useDispatch } from 'react-redux';
import { updateUserData } from '../../../store/slices/account';
import { useReturnToApp } from '../../config/accessControl';
import useFetch from '../../../hooks/useFetch';
import useAlert from '../../../hooks/useAlert';
import Typography from '@mui/material/Typography';
import { NON_FIELD_ERR } from '../../../util/constants';
import Preloader from '../../../uiKit/Preloader';
import Layout from '../../../uiKit/Layout';


function Verify() {
  const { uid, token } = useParams();
  const dispatch = useDispatch();
  const returnToApp = useReturnToApp();
  const showAlert = useAlert();

  const onSuccess = useCallback(userData => {
    dispatch(updateUserData(userData));
    showAlert('Your account was successfully verified!', 'success');
    returnToApp();
  }, []);
  const [, isProcessing, error] = useFetch(api.users.verify, {
    deps: [uid, token], onSuccess
  });

  function getContent() {
    if (error) {
      return <Typography>Error: {error.response.data[NON_FIELD_ERR].join('')}</Typography>;
    }

    if (isProcessing) {
      return (
        <>
          <Preloader size={80} />
          <Typography>Verification in progress...</Typography>
        </>
      );
    }

    return <Typography>Account verification</Typography>
  }

  return (
    <Layout.Center columnGap={2}>
      {getContent()}
    </Layout.Center>
  );
}

export default Verify;
