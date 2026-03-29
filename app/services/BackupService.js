import { ipcRenderer } from 'electron';
import { fs } from 'fs-extra';
import path from 'path';

class BackupService {
  constructor() {
    this.backupTasks = new Map();
    this.setupIPCListeners();
  }

  setupIPCListeners() {
    ipcRenderer.on('backup:progress', (event, taskId, progress) => {
      if (this.backupTasks.has(taskId)) {
        const task = this.backupTasks.get(taskId);
        task.progress = progress;
        if (task.onProgress) {
          task.onProgress(progress);
        }
      }
    });

    ipcRenderer.on('backup:complete', (event, taskId, result) => {
      if (this.backupTasks.has(taskId)) {
        const task = this.backupTasks.get(taskId);
        task.status = 'completed';
        if (task.onComplete) {
          task.onComplete(result);
        }
        this.backupTasks.delete(taskId);
      }
    });

    ipcRenderer.on('backup:error', (event, taskId, error) => {
      if (this.backupTasks.has(taskId)) {
        const task = this.backupTasks.get(taskId);
        task.status = 'error';
        task.error = error;
        if (task.onError) {
          task.onError(error);
        }
        this.backupTasks.delete(taskId);
      }
    });
  }

  async backupDevice(deviceId, backupPath, options = {}) {
    const taskId = `backup-${Date.now()}`;
    
    const task = {
      id: taskId,
      deviceId,
      backupPath,
      status: 'pending',
      progress: 0,
      options,
      onProgress: null,
      onComplete: null,
      onError: null
    };

    this.backupTasks.set(taskId, task);

    return new Promise((resolve, reject) => {
      task.onComplete = resolve;
      task.onError = reject;

      ipcRenderer.send('backup:start', {
        taskId,
        deviceId,
        backupPath,
        options
      });
    });
  }

  async getBackupHistory() {
    return new Promise((resolve) => {
      ipcRenderer.send('backup:get-history');
      ipcRenderer.once('backup:history', (event, history) => {
        resolve(history);
      });
    });
  }

  async restoreBackup(backupId, deviceId, options = {}) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('backup:restore', {
        backupId,
        deviceId,
        options
      });

      ipcRenderer.once('backup:restore-complete', (event, result) => {
        resolve(result);
      });

      ipcRenderer.once('backup:restore-error', (event, error) => {
        reject(error);
      });
    });
  }

  cancelBackup(taskId) {
    if (this.backupTasks.has(taskId)) {
      ipcRenderer.send('backup:cancel', taskId);
      this.backupTasks.delete(taskId);
    }
  }

  getBackupTask(taskId) {
    return this.backupTasks.get(taskId);
  }

  getAllBackupTasks() {
    return Array.from(this.backupTasks.values());
  }
}

export default new BackupService();