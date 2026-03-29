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
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@material-ui/core';
import { Download, Delete, Refresh, FilterList, Clear } from '@material-ui/icons';
import auditLogService from '../services/AuditLogService';

const AuditLogViewer = ({ open, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [limit, setLimit] = useState(100);
  const [logSize, setLogSize] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = auditLogService.getLogs(limit, filter || null);
      setLogs(fetchedLogs);
      const size = auditLogService.getLogFileSize();
      setLogSize(size);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setSnackbarMessage('Failed to load audit logs');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open, limit, filter]);

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all audit logs?')) {
      try {
        const success = auditLogService.clearLogs();
        if (success) {
          setLogs([]);
          setLogSize(0);
          setSnackbarMessage('Audit logs cleared successfully');
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage('Failed to clear audit logs');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error clearing audit logs:', error);
        setSnackbarMessage('Failed to clear audit logs');
        setSnackbarOpen(true);
      }
    }
  };

  const handleExportLogs = async () => {
    try {
      const desktopPath = require('os').homedir() + '/Desktop';
      const exportPath = `${desktopPath}/audit_logs_${new Date().toISOString().split('T')[0]}.log`;
      const success = auditLogService.exportLogs(exportPath);
      if (success) {
        setSnackbarMessage(`Audit logs exported to ${exportPath}`);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Failed to export audit logs');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      setSnackbarMessage('Failed to export audit logs');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Audit Logs</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="textSecondary">
              Log file size: {formatFileSize(logSize)}
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh logs">
                <IconButton onClick={loadLogs} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export logs">
                <IconButton onClick={handleExportLogs}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear logs">
                <IconButton onClick={handleClearLogs}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Box display="flex" gap={2} mb={2}>
            <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
              <InputLabel>Limit</InputLabel>
              <Select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                label="Limit"
              >
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
                <MenuItem value={500}>500</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter"
              >
                <MenuItem value="">All Operations</MenuItem>
                <MenuItem value="create_directory">Create Directory</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="rename">Rename</MenuItem>
                <MenuItem value="upload">Upload</MenuItem>
                <MenuItem value="download">Download</MenuItem>
                <MenuItem value="upload_encrypted">Upload Encrypted</MenuItem>
                <MenuItem value="download_encrypted">Download Encrypted</MenuItem>
                <MenuItem value="password_protect">Password Protect</MenuItem>
                <MenuItem value="unlock">Unlock</MenuItem>
                <MenuItem value="compress">Compress</MenuItem>
                <MenuItem value="extract">Extract</MenuItem>
                <MenuItem value="convert">Convert</MenuItem>
                <MenuItem value="sync">Sync</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider mb={2} />
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Operation</TableCell>
                <TableCell>File Path</TableCell>
                <TableCell>Device Type</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>{log.operation}</TableCell>
                    <TableCell style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.filePath}
                    </TableCell>
                    <TableCell>{log.deviceType}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

export default AuditLogViewer;