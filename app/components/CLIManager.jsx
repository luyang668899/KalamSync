import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
   Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { Copy, Terminal, Help, PlayArrow } from '@material-ui/icons';
import { ipcRenderer } from 'electron';

const CLIManager = ({ open, onClose }) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (open) {
      loadHelpText();
    }
  }, [open]);

  const loadHelpText = () => {
    ipcRenderer.send('cli:help');
    ipcRenderer.once('cli:help:response', (event, data) => {
      setHelpText(data);
    });
  };

  const handleRunCommand = () => {
    if (!command.trim()) return;

    // Add command to history
    setHistory((prev) => [command, ...prev].slice(0, 10));

    // Parse command and arguments
    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    // Run command
    ipcRenderer.send('cli:run', cmd, args);
    ipcRenderer.once('cli:run:response', (event, { result, error }) => {
      if (error) {
        setOutput(`Error: ${error}`);
      } else {
        setOutput(result);
      }
    });

    // Clear command input
    setCommand('');
  };

  const handleCommandHistorySelect = (cmd) => {
    setCommand(cmd);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbarMessage('Copied to clipboard');
      setSnackbarOpen(true);
    });
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
      <DialogTitle>Command Line Interface</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary">
            Run OpenMTP commands from the command line or directly from the app.
          </Typography>
        </Box>
        <Divider mb={3} />
        
        <Box mb={3}>
          <TextField
            label="Command"
            fullWidth
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command (e.g., help, version, transfer)"
            onKeyPress={(e) => e.key === 'Enter' && handleRunCommand()}
          />
          <Box mt={1} display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={handleRunCommand}
            >
              Run
            </Button>
            <Button
              variant="outlined"
              startIcon={<Help />}
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </Button>
          </Box>
        </Box>

        {showHelp && (
          <Box mb={3}>
            <Paper elevation={1} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
              <Typography variant="body2" fontFamily="monospace" whiteSpace="pre-wrap">
                {helpText}
              </Typography>
            </Paper>
          </Box>
        )}

        {output && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Output:
            </Typography>
            <Paper elevation={1} style={{ padding: 16, backgroundColor: '#f5f5f5' }}>
              <Typography variant="body2" fontFamily="monospace" whiteSpace="pre-wrap">
                {output}
              </Typography>
              <Box mt={1} display="flex" justifyContent="flex-end">
                <Button
                  size="small"
                  startIcon={<Copy />}
                  onClick={() => copyToClipboard(output)}
                >
                  Copy
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {history.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Command History:
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Command</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((cmd, index) => (
                    <TableRow key={index}>
                      <TableCell>{cmd}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleCommandHistorySelect(cmd)}
                        >
                          Use
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Examples
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Command</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>help</TableCell>
                  <TableCell>Show help message</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>version</TableCell>
                  <TableCell>Show version information</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>transfer /local/path mtp:/device/path file1.txt</TableCell>
                  <TableCell>Transfer files between devices</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>list mtp:/device/path</TableCell>
                  <TableCell>List files in a directory</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>info /local/file.txt</TableCell>
                  <TableCell>Get information about a file</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>open mtp:/device/path</TableCell>
                  <TableCell>Open a path in the app</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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

export default CLIManager;