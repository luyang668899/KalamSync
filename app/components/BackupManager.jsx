import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Progress, Snackbar, Alert, Chip } from '@mui/material';
import { Backup, Restore, History, Cancel, FolderOpen, CheckCircle, Error, Clock } from '@mui/icons-material';
import BackupService from '../services/BackupService';
import { getDevices } from '../selectors/deviceSelectors';

const BackupManager = () => {
  const [open, setOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [backupPath, setBackupPath] = useState('');
  const [backupOptions, setBackupOptions] = useState({
    includeSystemFiles: false,
    includeApps: true,
    includeMedia: true
  });
  const [backupHistory, setBackupHistory] = useState([]);
  const [currentBackup, setCurrentBackup] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const devices = useSelector(getDevices);

  useEffect(() => {
    loadBackupHistory();
  }, []);

  const loadBackupHistory = async () => {
    try {
      const history = await BackupService.getBackupHistory();
      setBackupHistory(history);
    } catch (error) {
      showSnackbar('Failed to load backup history', 'error');
    }
  };

  const handleOpen = () => {
    if (devices.length > 0) {
      setSelectedDevice(devices[0].id);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBackupPathChange = (event) => {
    setBackupPath(event.target.value);
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  const handleOptionChange = (option) => {
    setBackupOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleStartBackup = async () => {
    if (!selectedDevice || !backupPath) {
      showSnackbar('Please select a device and backup path', 'warning');
      return;
    }

    try {
      setCurrentBackup({ id: `backup-${Date.now()}`, progress: 0, status: 'in_progress' });
      const result = await BackupService.backupDevice(selectedDevice, backupPath, backupOptions);
      setCurrentBackup(null);
      showSnackbar('Backup completed successfully', 'success');
      loadBackupHistory();
    } catch (error) {
      setCurrentBackup(null);
      showSnackbar(`Backup failed: ${error.message}`, 'error');
    }
  };

  const handleRestoreBackup = async (backup) => {
    if (!selectedDevice) {
      showSnackbar('Please select a device to restore to', 'warning');
      return;
    }

    try {
      setCurrentBackup({ id: backup.id, progress: 0, status: 'restoring' });
      const result = await BackupService.restoreBackup(backup.id, selectedDevice);
      setCurrentBackup(null);
      showSnackbar('Restore completed successfully', 'success');
    } catch (error) {
      setCurrentBackup(null);
      showSnackbar(`Restore failed: ${error.message}`, 'error');
    }
  };

  const handleCancelBackup = () => {
    if (currentBackup) {
      BackupService.cancelBackup(currentBackup.id);
      setCurrentBackup(null);
      showSnackbar('Backup cancelled', 'info');
    }
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
        startIcon={<Backup />}
        onClick={handleOpen}
      >
        Backup Device
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Device Backup</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Device</InputLabel>
            <Select
              value={selectedDevice || ''}
              onChange={handleDeviceChange}
              label="Select Device"
            >
              {devices.map(device => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Backup Path"
            value={backupPath}
            onChange={handleBackupPathChange}
            placeholder="Enter backup directory path"
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => {
                  // Open folder picker
                  const { dialog } = window.require('electron').remote;
                  dialog.showOpenDialog({
                    properties: ['openDirectory']
                  }).then(result => {
                    if (!result.canceled && result.filePaths.length > 0) {
                      setBackupPath(result.filePaths[0]);
                    }
                  });
                }}>
                  <FolderOpen />
                </IconButton>
              )
            }}
          />

          <div style={{ margin: '16px 0' }}>
            <h4>Backup Options</h4>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Chip
                label="Include System Files"
                color={backupOptions.includeSystemFiles ? 'primary' : 'default'}
                onClick={() => handleOptionChange('includeSystemFiles')}
                clickable
              />
              <Chip
                label="Include Apps"
                color={backupOptions.includeApps ? 'primary' : 'default'}
                onClick={() => handleOptionChange('includeApps')}
                clickable
              />
              <Chip
                label="Include Media"
                color={backupOptions.includeMedia ? 'primary' : 'default'}
                onClick={() => handleOptionChange('includeMedia')}
                clickable
              />
            </div>
          </div>

          {currentBackup && (
            <div style={{ margin: '16px 0' }}>
              <Progress
                variant="determinate"
                value={currentBackup.progress}
                style={{ margin: '8px 0' }}
              />
              <div style={{ textAlign: 'center' }}>
                {currentBackup.status === 'in_progress' ? 'Backing up...' : 'Restoring...'}
              </div>
            </div>
          )}

          <div style={{ margin: '16px 0' }}>
            <h4>Backup History</h4>
            <List>
              {backupHistory.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No backup history" />
                </ListItem>
              ) : (
                backupHistory.map(backup => (
                  <ListItem key={backup.id}>
                    <ListItemText
                      primary={`Backup on ${new Date(backup.timestamp).toLocaleString()}`}
                      secondary={`Device: ${backup.deviceId}, Files: ${backup.totalFiles}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="restore"
                        onClick={() => handleRestoreBackup(backup)}
                      >
                        <Restore />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          </div>
        </DialogContent>
        <DialogActions>
          {currentBackup && (
            <Button onClick={handleCancelBackup} startIcon={<Cancel />}>
              Cancel
            </Button>
          )}
          <Button onClick={handleClose}>
            Close
          </Button>
          {!currentBackup && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Backup />}
              onClick={handleStartBackup}
            >
              Start Backup
            </Button>
          )}
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

export default BackupManager;