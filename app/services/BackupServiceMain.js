import { ipcMain } from 'electron';
import { fs } from 'fs-extra';
import path from 'path';
import { log } from '../utils/log';
import fileExplorerController from '../data/file-explorer/controllers/FileExplorerController';
import { settingsStorage } from '../helpers/storageHelper';

class BackupServiceMain {
  constructor() {
    this.backupTasks = new Map();
    this.setupIPCHandlers();
  }

  setupIPCHandlers() {
    ipcMain.on('backup:start', async (event, { taskId, deviceId, backupPath, options }) => {
      this.startBackup(event, taskId, deviceId, backupPath, options);
    });

    ipcMain.on('backup:cancel', (event, taskId) => {
      this.cancelBackup(taskId);
    });

    ipcMain.on('backup:get-history', (event) => {
      this.getBackupHistory(event);
    });

    ipcMain.on('backup:restore', async (event, { backupId, deviceId, options }) => {
      this.restoreBackup(event, backupId, deviceId, options);
    });
  }

  async startBackup(event, taskId, deviceId, backupPath, options) {
    try {
      // Create backup directory if it doesn't exist
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      // Get device files
      const deviceFiles = await this.getAllDeviceFiles(deviceId);
      const totalFiles = deviceFiles.length;
      let processedFiles = 0;

      // Create backup metadata
      const backupMetadata = {
        id: taskId,
        deviceId,
        timestamp: new Date().toISOString(),
        totalFiles,
        options,
        files: []
      };

      // Process each file
      for (const file of deviceFiles) {
        if (this.backupTasks.has(taskId) && this.backupTasks.get(taskId).cancelled) {
          event.sender.send('backup:error', taskId, 'Backup cancelled');
          return;
        }

        try {
          // Calculate relative path
          const relativePath = file.path.replace(/^\//, '');
          const destPath = path.join(backupPath, relativePath);

          // Create directory if needed
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          // Copy file
          await this.copyFileFromDevice(deviceId, file.path, destPath);

          // Update metadata
          backupMetadata.files.push({
            path: file.path,
            size: file.size,
            modifiedDate: file.modifiedDate
          });

          // Update progress
          processedFiles++;
          const progress = Math.round((processedFiles / totalFiles) * 100);
          event.sender.send('backup:progress', taskId, progress);
        } catch (error) {
          log.error(`Error backing up file ${file.path}: ${error}`, 'BackupServiceMain -> startBackup');
        }
      }

      // Save backup metadata
      const metadataPath = path.join(backupPath, 'backup.json');
      fs.writeFileSync(metadataPath, JSON.stringify(backupMetadata, null, 2));

      // Update backup history
      this.updateBackupHistory(backupMetadata);

      event.sender.send('backup:complete', taskId, {
        success: true,
        backupPath,
        totalFiles,
        processedFiles
      });
    } catch (error) {
      log.error(`Backup error: ${error}`, 'BackupServiceMain -> startBackup');
      event.sender.send('backup:error', taskId, error.message);
    } finally {
      this.backupTasks.delete(taskId);
    }
  }

  async getAllDeviceFiles(deviceId) {
    const files = [];
    const queue = ['/'];

    while (queue.length > 0) {
      const currentPath = queue.shift();
      try {
        const items = await fileExplorerController.listDirectory({
          deviceType: 'mtp',
          deviceId,
          path: currentPath
        });

        for (const item of items) {
          if (item.type === 'directory') {
            queue.push(item.path);
          } else {
            files.push(item);
          }
        }
      } catch (error) {
        log.error(`Error listing directory ${currentPath}: ${error}`, 'BackupServiceMain -> getAllDeviceFiles');
      }
    }

    return files;
  }

  async copyFileFromDevice(deviceId, sourcePath, destPath) {
    // This is a placeholder - actual implementation would use the file explorer controller to read the file
    // and write it to the destination
    try {
      // Get file content from device
      const fileContent = await fileExplorerController.readFile({
        deviceType: 'mtp',
        deviceId,
        path: sourcePath
      });

      // Write file to destination
      fs.writeFileSync(destPath, fileContent);
    } catch (error) {
      log.error(`Error copying file ${sourcePath} to ${destPath}: ${error}`, 'BackupServiceMain -> copyFileFromDevice');
      throw error;
    }
  }

  cancelBackup(taskId) {
    if (this.backupTasks.has(taskId)) {
      const task = this.backupTasks.get(taskId);
      task.cancelled = true;
    }
  }

  getBackupHistory(event) {
    try {
      const history = settingsStorage.getItems(['backupHistory']) || [];
      event.sender.send('backup:history', history);
    } catch (error) {
      log.error(`Error getting backup history: ${error}`, 'BackupServiceMain -> getBackupHistory');
      event.sender.send('backup:history', []);
    }
  }

  updateBackupHistory(backupMetadata) {
    try {
      const history = settingsStorage.getItems(['backupHistory']) || [];
      history.unshift(backupMetadata);
      // Keep only last 10 backups
      const trimmedHistory = history.slice(0, 10);
      settingsStorage.setItems({ backupHistory: trimmedHistory });
    } catch (error) {
      log.error(`Error updating backup history: ${error}`, 'BackupServiceMain -> updateBackupHistory');
    }
  }

  async restoreBackup(event, backupId, deviceId, options) {
    try {
      // Get backup history
      const history = settingsStorage.getItems(['backupHistory']) || [];
      const backup = history.find(b => b.id === backupId);

      if (!backup) {
        event.sender.send('backup:restore-error', 'Backup not found');
        return;
      }

      const backupPath = backup.backupPath;
      const metadataPath = path.join(backupPath, 'backup.json');

      if (!fs.existsSync(metadataPath)) {
        event.sender.send('backup:restore-error', 'Backup metadata not found');
        return;
      }

      // Read backup metadata
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const totalFiles = metadata.files.length;
      let processedFiles = 0;

      // Restore each file
      for (const file of metadata.files) {
        try {
          const sourcePath = path.join(backupPath, file.path.replace(/^\//, ''));
          const destPath = file.path;

          // Create directory if needed on device
          await this.createDirectoryOnDevice(deviceId, path.dirname(destPath));

          // Copy file to device
          await this.copyFileToDevice(deviceId, sourcePath, destPath);

          // Update progress
          processedFiles++;
          const progress = Math.round((processedFiles / totalFiles) * 100);
          event.sender.send('backup:progress', backupId, progress);
        } catch (error) {
          log.error(`Error restoring file ${file.path}: ${error}`, 'BackupServiceMain -> restoreBackup');
        }
      }

      event.sender.send('backup:restore-complete', {
        success: true,
        totalFiles,
        processedFiles
      });
    } catch (error) {
      log.error(`Restore error: ${error}`, 'BackupServiceMain -> restoreBackup');
      event.sender.send('backup:restore-error', error.message);
    }
  }

  async createDirectoryOnDevice(deviceId, dirPath) {
    // This is a placeholder - actual implementation would use the file explorer controller to create directories
    try {
      await fileExplorerController.createDirectory({
        deviceType: 'mtp',
        deviceId,
        path: dirPath
      });
    } catch (error) {
      // Directory might already exist, ignore error
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  async copyFileToDevice(deviceId, sourcePath, destPath) {
    // This is a placeholder - actual implementation would use the file explorer controller to write the file
    try {
      // Read file content
      const fileContent = fs.readFileSync(sourcePath);

      // Write file to device
      await fileExplorerController.writeFile({
        deviceType: 'mtp',
        deviceId,
        path: destPath,
        content: fileContent
      });
    } catch (error) {
      log.error(`Error copying file ${sourcePath} to device ${destPath}: ${error}`, 'BackupServiceMain -> copyFileToDevice');
      throw error;
    }
  }
}

new BackupServiceMain();