import Layout from '../../../uiKit/Layout';
import Typography from '@mui/material/Typography';


function NotVerified() {
  // TODO: resend
  return (
    <Layout.Center>
      <Typography>
        An email was sent to the address you provided. Please follow the link in it to verify your account.
      </Typography>
    </Layout.Center>
  );
}

export default NotVerified;
