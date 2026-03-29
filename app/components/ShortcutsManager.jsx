import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  Snackbar,
} from '@material-ui/core';
import { Copy, Info, ExternalLink } from '@material-ui/icons';
import { ipcRenderer } from 'electron';

const ShortcutsManager = ({ open, onClose }) => {
  const [shortcuts, setShortcuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShortcut, setSelectedShortcut] = useState(null);
  const [parameters, setParameters] = useState({});
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (open) {
      loadShortcuts();
    }
  }, [open]);

  const loadShortcuts = () => {
    setLoading(true);
    ipcRenderer.send('shortcuts:list');
    ipcRenderer.once('shortcuts:list:response', (event, data) => {
      setShortcuts(data);
      setLoading(false);
    });
  };

  const handleShortcutSelect = (shortcut) => {
    setSelectedShortcut(shortcut);
    // Reset parameters
    const initialParams = {};
    shortcut.parameters.forEach((param) => {
      initialParams[param.name] = '';
    });
    setParameters(initialParams);
    setGeneratedUrl('');
  };

  const handleParameterChange = (paramName, value) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const generateShortcutUrl = () => {
    if (!selectedShortcut) return;

    // Validate required parameters
    const missingParams = selectedShortcut.parameters
      .filter((param) => param.required)
      .filter((param) => !parameters[param.name]);

    if (missingParams.length > 0) {
      setSnackbarMessage(`Missing required parameter(s): ${missingParams.map((p) => p.name).join(', ')}`);
      setSnackbarOpen(true);
      return;
    }

    // Generate URL
    const url = new URL('openmtp://' + selectedShortcut.name);
    for (const [key, value] of Object.entries(parameters)) {
      if (value) {
        url.searchParams.append(key, value);
      }
    }
    setGeneratedUrl(url.toString());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbarMessage('URL copied to clipboard');
      setSnackbarOpen(true);
    });
  };

  const openAppleShortcuts = () => {
    if (!generatedUrl) return;
    // Generate Apple Shortcuts URL
    const appleShortcutUrl = new URL('shortcuts://run-shortcut');
    appleShortcutUrl.searchParams.append('name', 'OpenMTP Action');
    appleShortcutUrl.searchParams.append('input', 'text');
    appleShortcutUrl.searchParams.append('text', generatedUrl);
    window.open(appleShortcutUrl.toString());
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Apple Shortcuts Integration</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary">
            Create custom shortcuts to automate OpenMTP tasks. Use these URLs in the Apple Shortcuts app to create powerful workflows.
          </Typography>
        </Box>
        <Divider mb={3} />
        
        <Typography variant="h6" gutterBottom>
          Available Shortcuts
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Loading shortcuts...
                  </TableCell>
                </TableRow>
              ) : shortcuts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No shortcuts available
                  </TableCell>
                </TableRow>
              ) : (
                shortcuts.map((shortcut) => (
                  <TableRow 
                    key={shortcut.name}
                    onClick={() => handleShortcutSelect(shortcut)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{shortcut.name}</TableCell>
                    <TableCell>{shortcut.description}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShortcutSelect(shortcut);
                        }}
                      >
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedShortcut && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Configure {selectedShortcut.name} Shortcut
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                {selectedShortcut.description}
              </Typography>
            </Box>
            <Box mb={3}>
              {selectedShortcut.parameters.map((param) => (
                <Box key={param.name} mb={2}>
                  <TextField
                    label={param.name} 
                    fullWidth
                    required={param.required}
                    value={parameters[param.name] || ''}
                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                    placeholder={param.description}
                    helperText={param.required ? 'Required' : 'Optional'}
                  />
                </Box>
              ))}
            </Box>
            <Box mb={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={generateShortcutUrl}
              >
                Generate URL
              </Button>
            </Box>
            {generatedUrl && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Generated URL:
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    value={generatedUrl}
                    readOnly
                  />
                  <Button
                    onClick={() => copyToClipboard(generatedUrl)}
                  >
                    <Copy size={20} />
                  </Button>
                </Box>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ExternalLink />}
                    onClick={openAppleShortcuts}
                  >
                    Open in Apple Shortcuts
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ShortcutsManager;