import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Progress, Snackbar, Alert, TextField } from '@mui/material';
import { Wifi, WifiOff, Search, Connect, Disconnect, Refresh } from '@mui/icons-material';
import WirelessService from '../services/WirelessService';

const WirelessManager = () => {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // 组件挂载时扫描设备
    scanDevices();
  }, []);

  const scanDevices = async () => {
    try {
      setScanning(true);
      const foundDevices = await WirelessService.startScan();
      setDevices(foundDevices);
      showSnackbar(`Found ${foundDevices.length} devices`, 'info');
    } catch (error) {
      showSnackbar('Failed to scan for devices', 'error');
    } finally {
      setScanning(false);
    }
  };

  const connectToDevice = async (device) => {
    try {
      setConnecting(true);
      setSelectedDevice(device.id);
      await WirelessService.connectToDevice(device.id);
      showSnackbar(`Connected to ${device.name}`, 'success');
      // 更新设备列表
      const updatedDevices = WirelessService.getWirelessDevices();
      setDevices(updatedDevices);
    } catch (error) {
      showSnackbar(`Failed to connect: ${error}`, 'error');
    } finally {
      setConnecting(false);
      setSelectedDevice(null);
    }
  };

  const disconnectFromDevice = async (device) => {
    try {
      await WirelessService.disconnectFromDevice(device.id);
      showSnackbar(`Disconnected from ${device.name}`, 'info');
      // 更新设备列表
      const updatedDevices = WirelessService.getWirelessDevices();
      setDevices(updatedDevices);
    } catch (error) {
      showSnackbar(`Failed to disconnect: ${error}`, 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Wifi />}
        onClick={handleOpen}
      >
        Wireless Devices
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Wireless Device Manager</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: '16px' }}>
            <Button
              variant="outlined"
              startIcon={scanning ? <Refresh /> : <Search />}
              onClick={scanDevices}
              disabled={scanning}
              fullWidth
            >
              {scanning ? 'Scanning...' : 'Scan for Devices'}
            </Button>
          </div>

          {scanning && (
            <Progress variant="indeterminate" style={{ margin: '16px 0' }} />
          )}

          <List>
            {devices.length === 0 ? (
              <ListItem>
                <ListItemText primary="No wireless devices found" />
              </ListItem>
            ) : (
              devices.map(device => (
                <ListItem key={device.id}>
                  <ListItemText
                    primary={device.name}
                    secondary={`IP: ${device.ip} | Status: ${device.status}`}
                  />
                  <ListItemSecondaryAction>
                    {device.status === 'disconnected' ? (
                      <IconButton
                        edge="end"
                        aria-label="connect"
                        onClick={() => connectToDevice(device)}
                        disabled={connecting}
                      >
                        <Connect />
                      </IconButton>
                    ) : (
                      <IconButton
                        edge="end"
                        aria-label="disconnect"
                        onClick={() => disconnectFromDevice(device)}
                      >
                        <Disconnect />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>

          {connecting && selectedDevice && (
            <div style={{ marginTop: '16px' }}>
              <Progress variant="indeterminate" />
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                Connecting to device...
              </div>
            </div>
          )}
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

export default WirelessManager;