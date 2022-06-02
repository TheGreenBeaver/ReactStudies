import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';


function useAlert() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return (message, variant = 'info', Extra) =>
    enqueueSnackbar(message, {
      variant, action: key =>
        <Box display='flex' alignItems='center'>
          {!!Extra && <Extra onClick={() => closeSnackbar(key)} />}
          <IconButton onClick={() => closeSnackbar(key)}>
            <Close sx={{ color: `${variant}.contrastText` }} />
          </IconButton>
        </Box>,
    });
}

export default useAlert;