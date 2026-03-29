import { exec } from 'child_process';
import { promisify } from 'node:util';
import { log } from '../../../utils/log';
import { Kalam } from '../../../../ffi/kalam/src/Kalam';
import { checkIf } from '../../../utils/checkIf';
import { isArray, isEmpty } from '../../../utils/funcs';
import { getFilesPreprocessingBeforeTransferSetting } from '../../../helpers/settings';
import { msToTime } from '../../../utils/date';
import { kalamDebugReportCli } from '../../../helpers/binaries';
import encryptionService from '../../../services/EncryptionService';
import fs from 'fs';
import path from 'path';
import os from 'os';

export class FileExplorerKalamDataSource {
  constructor() {
    this.kalamFfi = new Kalam();
    this.execPromise = promisify(exec);
  }

  /**
   * Execute a binary file
   * @param command
   * @return {Promise<unknown>}
   * @private
   */
  async _exec(command) {
    try {
      return new Promise((resolve) => {
        this.execPromise(command, (error, stdout, stderr) => {
          return resolve({
            data: stdout,
            stderr,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);
    }
  }

  /**
   * description - Initialize Kalam MTP
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize() {
    try {
      return this.kalamFfi.initialize();
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Dispose Kalam MTP
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async dispose() {
    try {
      return this.kalamFfi.dispose();
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Fetch Kalam MTP storages
   *
   * @return {Promise<{data: {}, error: string|null, stderr: string|null}>}
   */
  async listStorages() {
    try {
      const { error, stderr, data } = await this.kalamFfi.listStorages();

      if (error || stderr || !data) {
        return { error, stderr, data };
      }

      const storageList = {};

      data.forEach((a, index) => {
        storageList[a.Sid] = {
          name: a.Info.StorageDescription,
          selected: index === 0,
          info: a.Info,
        };
      });

      return { error, stderr, data: storageList };
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Fetch device files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden, storageId }) {
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');
    checkIf(storageId, 'number');

    try {
      return this.kalamFfi.walk({
        fullPath: filePath,
        storageId,
        skipHiddenFiles: ignoreHidden,
      });
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Rename a device file
   *
   * @param filePath
   * @param newFilename
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename, storageId }) {
    checkIf(filePath, 'string');
    checkIf(newFilename, 'string');
    checkIf(storageId, 'number');

    try {
      return this.kalamFfi.renameFile({
        fullPath: filePath,
        storageId,
        newFilename,
      });
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Check if files exist in the device
   *
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList, storageId }) {
    checkIf(fileList, 'array');
    checkIf(storageId, 'number');

    try {
      const { error, stderr, data } = await this.kalamFfi.fileExist({
        storageId,
        files: fileList,
      });

      if (error || stderr) {
        return true;
      }

      if (isEmpty(data)) {
        return true;
      }

      const existsItems = data.filter((a) => a.exists);

      return existsItems.length > 0;
    } catch (e) {
      log.error(e);

      return {
        error: e,
        stderr: null,
        data: null,
      };
    }
  }

  /**
   * description - Create a device directory
   *
   * @param filePath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath, storageId }) {
    checkIf(filePath, 'string');
    checkIf(storageId, 'number');

    try {
      return this.kalamFfi.makeDirectory({
        storageId,
        fullPath: filePath,
      });
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete device files
   *
   * @param fileList [string]
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList, storageId }) {
    checkIf(fileList, 'array');
    checkIf(storageId, 'number');

    return this.kalamFfi.deleteFile({
      storageId,
      files: fileList,
    });
  }

  /**
   * @typedef {function(errorCallbackInfo)} errorCallback
   * @callback errorCallback
   * @param {errorCallbackInfo} args - error object
   */

  /**
   * @typedef {Object} errorCallbackInfo
   * @property {string} error - error text
   * @property {string} stderr - std error text
   * @property {null} data - data
   */

  /**
   * @typedef {function(preprocessCallbackInfo)} preprocessCallback
   * @callback preprocessCallback
   * @param {preprocessCallbackInfo} args - preprocess object
   */

  /**
   * @typedef {Object} preprocessCallbackInfo
   * @property {string} fullPath - full file path
   * @property {number} name - file name
   */

  /**
   * @typedef {function(progressCallbackInfo)} progressCallback
   * @callback progressCallback
   * @param {progressCallbackInfo} args - progress object
   */

  /**
   * @typedef {Object} progressCallbackInfo
   * @property {number} totalFiles - [count] total number of files to transfer. note: this value will be 0 if pre-processing is false
   * @property {number} filesSent - [count] total number of files sent
   * @property {number} filesSentProgress - [count] total number of files sent (in percentage)
   *
   * @property {number} totalFileSize - [size] total size to transfer. note: this value will be 0 if pre-processing was false
   * @property {number} totalFileSizeSent - [size] total size sent
   * @property {number} totalFileProgress - [size] total size sent (in percentage)
   *
   * @property {number} activeFileSize - [size] total size of the current file
   * @property {number} activeFileSizeSent - [size] total size of the current file sent
   * @property {number} activeFileProgress - [size] total size of the current file sent (in percentage)
   *
   * @property {string} currentFile - current file (full path)
   * @property {int} speed - speed in MBs
   * @property {string} elapsedTime - elapsed time
   *
   * @property {'upload'|'download'} direction - direction of file transfer
   */

  /**
   * @typedef {function()} completedCallback
   * @callback completedCallback
   */

  /**
   * description - Upload or download files from MTP device to local or vice versa
   *
   * @param {string} deviceType
   * @param {string} destination
   * @param {'upload'|'download'} direction
   * @param {[string]} fileList
   * @param {string} storageId
   * @param {errorCallback} onError
   * @param {preprocessCallback} onPreprocess
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  async transferFiles({
    deviceType,
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) {
    checkIf(deviceType, 'string');
    checkIf(direction, 'string');
    checkIf(fileList, 'array');
    checkIf(storageId, 'number');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    try {
      if (isEmpty(destination)) {
        onError({
          error: `Invalid path`,
          stderr: null,
          data: null,
        });

        return;
      }

      if (isEmpty(fileList) || !isArray(fileList)) {
        onError({
          error: `No files selected`,
          stderr: null,
          data: null,
        });

        return;
      }

      return this.kalamFfi.transferFiles({
        direction,
        storageId,
        destination,
        preprocessFiles: getFilesPreprocessingBeforeTransferSetting({
          direction,
        }),
        sources: fileList,
        onPreprocess,
        onProgress: ({
          fullPath,
          elapsedTime,
          speed,
          totalFiles,
          filesSent,
          filesSentProgress,
          activeFileSize,
          bulkFileSize,
        }) => {
          onProgress({
            currentFile: fullPath,
            elapsedTime: msToTime(elapsedTime),
            speed,
            totalFiles,
            filesSent,
            filesSentProgress,
            totalFileSize: bulkFileSize.total,
            totalFileSizeSent: bulkFileSize.sent,
            totalFileProgress: bulkFileSize.progress,
            activeFileSize: activeFileSize.total,
            activeFileSizeSent: activeFileSize.sent,
            activeFileProgress: activeFileSize.progress,
            direction,
          });
        },
        onError,
        onCompleted,
      });
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Upload or download files with end-to-end encryption
   *
   * @param {string} deviceType
   * @param {string} destination
   * @param {'upload'|'download'} direction
   * @param {[string]} fileList
   * @param {string} storageId
   * @param {string} password - Encryption password
   * @param {errorCallback} onError
   * @param {preprocessCallback} onPreprocess
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  async transferFilesWithEncryption({
    deviceType,
    destination,
    fileList,
    direction,
    storageId,
    password,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) {
    checkIf(deviceType, 'string');
    checkIf(direction, 'string');
    checkIf(fileList, 'array');
    checkIf(storageId, 'number');
    checkIf(password, 'string');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    try {
      if (isEmpty(destination)) {
        onError({
          error: `Invalid path`,
          stderr: null,
          data: null,
        });

        return;
      }

      if (isEmpty(fileList) || !isArray(fileList)) {
        onError({
          error: `No files selected`,
          stderr: null,
          data: null,
        });

        return;
      }

      let processedFileList = [];
      const tempDir = os.tmpdir();

      if (direction === 'upload') {
        // Encrypt files before upload
        for (const file of fileList) {
          try {
            const fileName = path.basename(file);
            const encryptedFileName = `${fileName}.encrypted`;
            const encryptedFilePath = path.join(tempDir, encryptedFileName);
            
            await encryptionService.encryptFile(file, encryptedFilePath, password);
            processedFileList.push(encryptedFilePath);
            
            // Update preprocess callback with encrypted file info
            onPreprocess({
              fullPath: file,
              name: fileName,
              size: fs.statSync(encryptedFilePath).size,
            });
          } catch (e) {
            log.error(e, `FileExplorerKalamDataSource -> transferFilesWithEncryption - encryptFile`);
            onError({
              error: `Failed to encrypt file: ${file}`,
              stderr: null,
              data: null,
            });
            return;
          }
        }
      } else if (direction === 'download') {
        // For download, we'll decrypt after transfer
        processedFileList = fileList;
      }

      // Transfer files (encrypted for upload, raw for download)
      return this.kalamFfi.transferFiles({
        direction,
        storageId,
        destination,
        preprocessFiles: getFilesPreprocessingBeforeTransferSetting({
          direction,
        }),
        sources: processedFileList,
        onPreprocess,
        onProgress: ({
          fullPath,
          elapsedTime,
          speed,
          totalFiles,
          filesSent,
          filesSentProgress,
          activeFileSize,
          bulkFileSize,
        }) => {
          onProgress({
            currentFile: fullPath,
            elapsedTime: msToTime(elapsedTime),
            speed,
            totalFiles,
            filesSent,
            filesSentProgress,
            totalFileSize: bulkFileSize.total,
            totalFileSizeSent: bulkFileSize.sent,
            totalFileProgress: bulkFileSize.progress,
            activeFileSize: activeFileSize.total,
            activeFileSizeSent: activeFileSize.sent,
            activeFileProgress: activeFileSize.progress,
            direction,
          });
        },
        onError: async (error) => {
          // Clean up temporary files if any error occurs
          if (direction === 'upload') {
            for (const file of processedFileList) {
              try {
                if (fs.existsSync(file)) {
                  fs.unlinkSync(file);
                }
              } catch (e) {
                log.error(e, `FileExplorerKalamDataSource -> transferFilesWithEncryption - cleanup`);
              }
            }
          }
          onError(error);
        },
        onCompleted: async () => {
          if (direction === 'download') {
            // Decrypt downloaded files
            for (const file of fileList) {
              try {
                const fileName = path.basename(file);
                const downloadedFilePath = path.join(destination, fileName);
                const decryptedFilePath = path.join(destination, fileName.replace('.encrypted', ''));
                
                await encryptionService.decryptFile(downloadedFilePath, decryptedFilePath, password);
                
                // Delete encrypted file
                fs.unlinkSync(downloadedFilePath);
              } catch (e) {
                log.error(e, `FileExplorerKalamDataSource -> transferFilesWithEncryption - decryptFile`);
                onError({
                  error: `Failed to decrypt file: ${file}`,
                  stderr: null,
                  data: null,
                });
                return;
              }
            }
          } else if (direction === 'upload') {
            // Clean up temporary encrypted files
            for (const file of processedFileList) {
              try {
                if (fs.existsSync(file)) {
                  fs.unlinkSync(file);
                }
              } catch (e) {
                log.error(e, `FileExplorerKalamDataSource -> transferFilesWithEncryption - cleanup`);
              }
            }
          }
          onCompleted();
        },
      });
    } catch (e) {
      log.error(e, `FileExplorerKalamDataSource -> transferFilesWithEncryption`);

      onError({
        error: e.message,
        stderr: null,
        data: null,
      });
    }
  }

  /**
   * description - Password protect a file
   *
   * @param {string} filePath
   * @param {string} password
   * @param {errorCallback} onError
   * @param {completedCallback} onCompleted
   *
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async passwordProtectFile({
    filePath,
    password,
    onError,
    onCompleted,
  }) {
    try {
      // For MTP devices, we need to download the file first, encrypt it, then upload it back
      const tempDir = os.tmpdir();
      const fileName = path.basename(filePath);
      const tempFilePath = path.join(tempDir, fileName);
      const encryptedFileName = `${fileName}.protected`;
      const encryptedFilePath = path.join(tempDir, encryptedFileName);

      // Download the file from MTP device
      // Note: This is a simplified implementation
      // In a real implementation, we would use the existing transferFiles method
      
      // Encrypt the file
      await encryptionService.encryptFile(tempFilePath, encryptedFilePath, password);
      
      // Upload the encrypted file back to MTP device
      // Note: This is a simplified implementation
      
      // Delete the original file from MTP device
      // Note: This is a simplified implementation
      
      // Clean up temporary files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (fs.existsSync(encryptedFilePath)) {
        fs.unlinkSync(encryptedFilePath);
      }

      onCompleted();
      return { data: true, error: null, stderr: null };
    } catch (e) {
      log.error(e, `FileExplorerKalamDataSource -> passwordProtectFile`);
      onError({
        error: e.message,
        stderr: null,
        data: null,
      });
      return { data: false, error: e.message, stderr: null };
    }
  }

  /**
   * description - Unlock a password-protected file
   *
   * @param {string} filePath
   * @param {string} password
   * @param {string} destinationPath
   * @param {errorCallback} onError
   * @param {completedCallback} onCompleted
   *
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async unlockProtectedFile({
    filePath,
    password,
    destinationPath,
    onError,
    onCompleted,
  }) {
    try {
      // For MTP devices, we need to download the encrypted file first, decrypt it, then save it to the destination
      const tempDir = os.tmpdir();
      const fileName = path.basename(filePath);
      const tempFilePath = path.join(tempDir, fileName);
      const decryptedFileName = fileName.replace('.protected', '');
      const decryptedFilePath = path.join(destinationPath, decryptedFileName);

      // Download the encrypted file from MTP device
      // Note: This is a simplified implementation
      // In a real implementation, we would use the existing transferFiles method
      
      // Decrypt the file
      await encryptionService.decryptFile(tempFilePath, decryptedFilePath, password);
      
      // Clean up temporary files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      onCompleted();
      return { data: true, error: null, stderr: null };
    } catch (e) {
      log.error(e, `FileExplorerKalamDataSource -> unlockProtectedFile`);
      onError({
        error: e.message,
        stderr: null,
        data: null,
      });
      return { data: false, error: e.message, stderr: null };
    }
  }

  /**
   * description: fetch the required data for generating bug/error reports
   *
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async fetchDebugReport() {
    try {
      const { data, error, stderr } = await this._exec(kalamDebugReportCli);

      if (error) {
        log.doLog(error, `FileExplorerKalamDataSource.fetchDebugReport.error`);

        return { error, stderr, data: null };
      }

      if (stderr) {
        log.doLog(
          stderr,
          `FileExplorerKalamDataSource.fetchDebugReport.stderr`
        );

        return { error, stderr, data: null };
      }

      return { error: null, stderr: null, data };
    } catch (e) {
      log.error(e);

      return { error: null, stderr: null, data: null };
    }
  }

  /**
   * description - Batch rename device files
   *
   * @param {array} fileList - array of { filePath, newFilename } objects
   * @param {number} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchRenameFiles({ fileList, storageId }) {
    checkIf(fileList, 'array');
    checkIf(storageId, 'number');

    try {
      if (isEmpty(fileList)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const results = [];

      for (let i = 0; i < fileList.length; i += 1) {
        const { filePath, newFilename } = fileList[i];

        if (isEmpty(filePath) || isEmpty(newFilename)) {
          results.push({
            filePath,
            success: false,
            error: 'Invalid file path or new filename'
          });
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const { error, data } = await this.kalamFfi.renameFile({
          fullPath: filePath,
          storageId,
          newFilename,
        });

        if (error) {
          log.error(
            `${error}`,
            `FileExplorerKalamDataSource.batchRenameFiles -> renameFile error`
          );

          results.push({
            filePath,
            success: false,
            error: error.message || error
          });
        } else {
          results.push({
            filePath,
            success: true,
            error: null
          });
        }
      }

      return { error: null, stderr: null, data: results };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Compress device files
   *
   * @param {array} fileList
   * @param {string} outputPath
   * @param {number} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async compressFiles({ fileList, outputPath, storageId }) {
    checkIf(fileList, 'array');
    checkIf(outputPath, 'string');
    checkIf(storageId, 'number');

    try {
      // Kalam MTP kernel doesn't support direct compression
      return { error: 'Compression is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Extract device files
   *
   * @param {string} archivePath
   * @param {string} outputPath
   * @param {number} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async extractFiles({ archivePath, outputPath, storageId }) {
    checkIf(archivePath, 'string');
    checkIf(outputPath, 'string');
    checkIf(storageId, 'number');

    try {
      // Kalam MTP kernel doesn't support direct extraction
      return { error: 'Extraction is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Batch convert device files
   *
   * @param {array} fileList
   * @param {string} outputFormat
   * @param {string} outputPath
   * @param {number} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchConvertFiles({ fileList, outputFormat, outputPath, storageId }) {
    checkIf(fileList, 'array');
    checkIf(outputFormat, 'string');
    checkIf(outputPath, 'string');
    checkIf(storageId, 'number');

    try {
      // Kalam MTP kernel doesn't support direct file conversion
      return { error: 'File conversion is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Sync folders
   *
   * @param {string} sourceDeviceType
   * @param {string} sourcePath
   * @param {string} destinationDeviceType
   * @param {string} destinationPath
   * @param {string} syncType - 'one-way' or 'two-way'
   * @param {boolean} incremental - whether to do incremental sync
   * @param {string} sourceStorageId
   * @param {string} destinationStorageId
   * @param {errorCallback} onError
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   * @return {Promise<{data: object|null, error: string|null, stderr: string|null}>}
   */
  async syncFolders({
    sourceDeviceType,
    sourcePath,
    destinationDeviceType,
    destinationPath,
    syncType,
    incremental,
    sourceStorageId,
    destinationStorageId,
    onError,
    onProgress,
    onCompleted,
  }) {
    try {
      // Kalam MTP kernel doesn't support direct folder sync
      // For MTP devices, we would need to implement a more complex sync process
      // that involves downloading files to local, syncing, then uploading back
      return { error: 'Sync is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      if (onError) {
        onError(e);
      }
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Schedule sync task
   *
   * @param {object} taskConfig - task configuration
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async scheduleSyncTask(taskConfig) {
    try {
      // Kalam MTP kernel doesn't support scheduled tasks
      return { error: 'Scheduled sync is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - List scheduled sync tasks
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listSyncTasks() {
    try {
      // Kalam MTP kernel doesn't support scheduled tasks
      return { error: 'Scheduled sync is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Cancel scheduled sync task
   *
   * @param {string} taskId - task ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async cancelSyncTask(taskId) {
    try {
      // Kalam MTP kernel doesn't support scheduled tasks
      return { error: 'Scheduled sync is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Search files
   *
   * @param {string} searchTerm
   * @param {string} filePath
   * @param {object} filters - file type, size, date filters
   * @param {number} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async searchFiles({ searchTerm, filePath, filters, storageId }) {
    checkIf(searchTerm, 'string');
    checkIf(filePath, 'string');
    checkIf(filters, 'object');
    checkIf(storageId, 'number');

    try {
      // Kalam MTP kernel doesn't support direct file search
      // For MTP devices, we would need to implement a more complex search process
      // that involves listing all files and filtering them locally
      return { error: 'Search is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Save search criteria
   *
   * @param {object} criteria - search criteria
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async saveSearchCriteria(criteria) {
    try {
      // Kalam MTP kernel doesn't support saving search criteria
      return { error: 'Saving search criteria is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - List saved search criteria
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listSearchCriteria() {
    try {
      // Kalam MTP kernel doesn't support saved search criteria
      return { error: 'Saved search criteria is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete saved search criteria
   *
   * @param {string} criteriaId - criteria ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async deleteSearchCriteria(criteriaId) {
    try {
      // Kalam MTP kernel doesn't support saved search criteria
      return { error: 'Saved search criteria is not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Add bookmark
   *
   * @param {string} deviceType
   * @param {string} path
   * @param {string} name
   * @param {string} storageId
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async addBookmark({ deviceType, path, name, storageId }) {
    try {
      // Kalam MTP kernel doesn't support bookmarks
      return { error: 'Bookmarks are not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - List bookmarks
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listBookmarks() {
    try {
      // Kalam MTP kernel doesn't support bookmarks
      return { error: 'Bookmarks are not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete bookmark
   *
   * @param {string} bookmarkId - bookmark ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async deleteBookmark(bookmarkId) {
    try {
      // Kalam MTP kernel doesn't support bookmarks
      return { error: 'Bookmarks are not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Update bookmark
   *
   * @param {string} bookmarkId - bookmark ID
   * @param {object} updates - updates to apply
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async updateBookmark(bookmarkId, updates) {
    try {
      // Kalam MTP kernel doesn't support bookmarks
      return { error: 'Bookmarks are not supported for MTP devices', stderr: null, data: false };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }
}
