import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Snackbar, Alert } from '@mui/material';
import { Devices, Usb, Refresh, CheckCircle } from '@mui/icons-material';
import { makeMtpDevices, makeActiveMtpDeviceId } from '../containers/HomePage/selectors';
import { setActiveMtpDevice } from '../containers/HomePage/actions';

const MtpDeviceManager = () => {
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const mtpDevices = useSelector(makeMtpDevices);
  const activeMtpDeviceId = useSelector(makeActiveMtpDeviceId);
  const dispatch = useDispatch();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeviceSelect = (deviceId) => {
    dispatch(setActiveMtpDevice(deviceId));
    showSnackbar('Device selected successfully', 'success');
    handleClose();
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Devices />}
        onClick={handleOpen}
      >
        MTP Devices
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>MTP Device Manager</DialogTitle>
        <DialogContent>
          <List>
            {Object.keys(mtpDevices).length === 0 ? (
              <ListItem>
                <ListItemText primary="No MTP devices connected" />
              </ListItem>
            ) : (
              Object.entries(mtpDevices).map(([deviceId, device]) => (
                <ListItem
                  key={deviceId}
                  button
                  onClick={() => handleDeviceSelect(deviceId)}
                  selected={deviceId === activeMtpDeviceId}
                >
                  <ListItemText
                    primary={device.info?.mtpDeviceInfo?.FriendlyName || `Device ${deviceId}`}
                    secondary={`Status: ${device.isAvailable ? 'Connected' : 'Disconnected'}`}
                  />
                  <ListItemSecondaryAction>
                    {deviceId === activeMtpDeviceId && (
                      <IconButton edge="end" aria-label="active">
                        <CheckCircle color="primary" />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MtpDeviceManager;