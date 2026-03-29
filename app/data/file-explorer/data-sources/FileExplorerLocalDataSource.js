import path from 'path';
import { promisify } from 'node:util';
import junk from 'junk';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import macosVersion from 'macos-version';
import fs from 'fs';
import {
  readdir as fsReaddir,
  existsSync,
  statSync,
  lstatSync,
  rename as fsRename,
  readlink,
  realpathSync,
} from 'fs';
import findLodash from 'lodash/find';
import { log } from '../../../utils/log';
import { isArray, isEmpty, undefinedOrNull } from '../../../utils/funcs';
import { pathUp } from '../../../utils/files';
import { appDateFormat } from '../../../utils/date';
import { checkIf } from '../../../utils/checkIf';
import { PATHS } from '../../../constants/paths';
import { NODE_MAC_PERMISSIONS_MIN_OS } from '../../../constants';
import encryptionService from '../../../services/EncryptionService';

export class FileExplorerLocalDataSource {
  constructor() {
    this.readdir = promisify(fsReaddir);
  }

  /**
   * description - make directory helper
   *
   */
  async _mkdir({ filePath }) {
    try {
      return new Promise((resolve) => {
        mkdirp(filePath)
          .then((data) => {
            resolve({ data, stderr: null, error: null });

            return data;
          })
          .catch((error) => {
            resolve({ data: null, stderr: error, error });
          });
      });
    } catch (e) {
      log.error(e);
    }
  }

  /**
   * description - Rename file helper
   *
   */
  _rename({ filePath, newFilename }) {
    try {
      const parentDir = pathUp(filePath);
      const newFilePath = path.join(parentDir, newFilename);

      return new Promise((resolve) => {
        fsRename(filePath, newFilePath, (error) => {
          return resolve({
            data: null,
            stderr: error,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);

      return {
        data: null,
        stderr: null,
        error: e,
      };
    }
  }

  /**
   * description - Delete file helper
   *
   */
  _delete = (file) => {
    try {
      return new Promise((resolve) => {
        rimraf(file, {}, (error) => {
          resolve({
            data: null,
            stderr: error,
            error,
          });
        });
      });
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  };

  /**
   * description - request the usage access of the protected directories in macos
   * @private
   *
   * @param filePath {string}
   * @return {Promise<boolean>}
   */
  _requestUsageAccess = async ({ filePath }) => {
    const doesCurrentOsSupportNodeMacPermission =
      macosVersion.isGreaterThanOrEqualTo(NODE_MAC_PERMISSIONS_MIN_OS);

    if (!doesCurrentOsSupportNodeMacPermission) {
      return true;
    }

    const { askForFoldersAccess, askForPhotosAccess } = await import(
      // eslint-disable-next-line import/no-unresolved
      'node-mac-permissions'
    );

    checkIf(filePath, 'string');

    const isGrantedString = 'authorized';

    let result;

    if (filePath.startsWith(PATHS.desktopDir)) {
      result = await askForFoldersAccess('desktop');
    } else if (filePath.startsWith(PATHS.downloadsDir)) {
      result = await askForFoldersAccess('downloads');
    } else if (filePath.startsWith(PATHS.documentsDir)) {
      result = await askForFoldersAccess('documents');
    } else if (filePath.startsWith(PATHS.picturesDir)) {
      result = await askForPhotosAccess();
    }

    if (undefinedOrNull(result)) {
      return true;
    }

    return result === isGrantedString;
  };

  /**
   *
   * description - returns file info needed for navigating through symlinks
   * @private
   *
   * @param fullPath
   * @returns {Promise<{isFolder: boolean, symlink: string|null}>}
   * @private
   */
  _getSymlinkInfo = async ({ fullPath }) => {
    const symlink = await new Promise((resolve) => {
      try {
        readlink(fullPath, (err, lnk) => {
          if (err) {
            return resolve(null);
          }

          if (!undefinedOrNull(lnk) && existsSync(lnk)) {
            return resolve(realpathSync(lnk));
          }

          return resolve(null);
        });
      } catch (e) {
        return resolve(null);
      }
    });

    const isFolder = lstatSync(symlink ?? fullPath).isDirectory();

    return {
      isFolder,
      symlink,
    };
  };

  /**
   * description - Fetch local files in the path
   *
   * @param filePath
   * @param ignoreHidden
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ filePath, ignoreHidden }) {
    try {
      const _accessGranted = await this._requestUsageAccess({ filePath });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const response = [];
      const { error, data } = await this.readdir(filePath, 'utf8')
        .then((res) => {
          return {
            data: res,
            error: null,
          };
        })
        .catch((e) => {
          return {
            data: null,
            error: e,
          };
        });

      if (error) {
        log.error(error, `FileExplorerLocalDataSource.listFiles`);

        return { error, data: null };
      }

      let files = data;

      files = data.filter(junk.not);
      if (ignoreHidden) {
        // eslint-disable-next-line no-useless-escape
        files = data.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
      }

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];

        const fullPath = path.resolve(filePath, file);

        // eslint-disable-next-line no-await-in-loop
        const { isFolder, symlink } = await this._getSymlinkInfo({
          fullPath,
        });

        if (!existsSync(fullPath)) {
          continue; // eslint-disable-line no-continue
        }

        const stat = statSync(fullPath);
        const extension = path.extname(fullPath);
        const { size, atime: dateTime } = stat;

        if (findLodash(response, { path: fullPath })) {
          continue; // eslint-disable-line no-continue
        }

        response.push({
          name: file,
          path: fullPath,
          extension,
          size,
          isFolder,
          dateAdded: appDateFormat(dateTime),
          symlink,
        });
      }

      return { error, data: response };
    } catch (e) {
      log.error(e);

      return { error: e, data: null };
    }
  }

  /**
   * description - Rename a local file
   *
   * @param filePath
   * @param newFilename
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ filePath, newFilename }) {
    try {
      if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const _accessGranted = await this._requestUsageAccess({ filePath });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const { error } = await this._rename({ filePath, newFilename });

      if (error) {
        log.error(
          `${error}`,
          `FileExplorerLocalDataSource.renameFile -> mv error`
        );

        return { error, stderr: null, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Delete a local file
   *
   * @param fileList
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ fileList }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const filePath = fileList[i];

        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({ filePath });

        if (!_accessGranted) {
          return {
            data: null,
            error: 'Permission denied',
          };
        }

        // eslint-disable-next-line no-await-in-loop
        const { error } = await this._delete(filePath);

        if (error) {
          log.error(
            `${error}`,
            `FileExplorerLocalDataSource.deleteFiles -> rm error`
          );

          return { error, stderr: null, data: false };
        }
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Create a local directory
   *
   * @param {string} filePath
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ filePath }) {
    try {
      if (undefinedOrNull(filePath)) {
        return { error: `Invalid path.`, stderr: null, data: null };
      }

      // eslint-disable-next-line no-await-in-loop
      const _accessGranted = await this._requestUsageAccess({
        filePath,
      });

      if (!_accessGranted) {
        return {
          data: null,
          error: 'Permission denied',
        };
      }

      const { error } = await this._mkdir({ filePath });

      if (error) {
        log.error(
          `${error}`,
          `FileExplorerLocalDataSource.makeDirectory -> mkdir error`
        );

        return { error, stderr: null, data: false };
      }

      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);

      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Check if files exist in the local disk
   *
   * @param {[string]} fileList
   * @return {Promise<boolean>}
   */
  async filesExist({ fileList }) {
    try {
      if (!isArray(fileList)) {
        return false;
      }

      if (isEmpty(fileList)) {
        return false;
      }

      for (let i = 0; i < fileList.length; i += 1) {
        const item = fileList[i];
        const fullPath = path.resolve(item);

        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({
          filePath: fullPath,
        });

        if (!_accessGranted) {
          return {
            data: null,
            error: 'Permission denied',
          };
        }

        // eslint-disable-next-line no-await-in-loop
        if (await existsSync(fullPath)) {
          return true;
        }
      }

      return false;
    } catch (e) {
      log.error(e);

      return false;
    }
  }

  /**
   * description - Batch rename local files
   *
   * @param {array} fileList - array of { filePath, newFilename } objects
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchRenameFiles({ fileList }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      const results = [];

      for (let i = 0; i < fileList.length; i += 1) {
        const { filePath, newFilename } = fileList[i];

        if (undefinedOrNull(filePath) || undefinedOrNull(newFilename)) {
          results.push({
            filePath,
            success: false,
            error: 'Invalid file path or new filename'
          });
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const _accessGranted = await this._requestUsageAccess({ filePath });

        if (!_accessGranted) {
          results.push({
            filePath,
            success: false,
            error: 'Permission denied'
          });
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const { error } = await this._rename({ filePath, newFilename });

        if (error) {
          log.error(
            `${error}`,
            `FileExplorerLocalDataSource.batchRenameFiles -> mv error`
          );

          results.push({
            filePath,
            success: false,
            error: error.message
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
   * description - Compress local files
   *
   * @param {array} fileList
   * @param {string} outputPath
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async compressFiles({ fileList, outputPath }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      if (undefinedOrNull(outputPath)) {
        return { error: `Invalid output path.`, stderr: null, data: null };
      }

      // Request usage access for the first file's directory
      if (fileList.length > 0) {
        const _accessGranted = await this._requestUsageAccess({ filePath: fileList[0] });
        if (!_accessGranted) {
          return { data: null, error: 'Permission denied', stderr: null };
        }
      }

      // Use zip command on macOS
      const files = fileList.map(file => `"${file}"`).join(' ');
      const command = `zip -r "${outputPath}" ${files}`;

      return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(command, (error, stdout, stderr) => {
          if (error) {
            log.error(`${error}`, `FileExplorerLocalDataSource.compressFiles -> zip error`);
            return resolve({ error, stderr, data: false });
          }
          return resolve({ error: null, stderr: null, data: true });
        });
      });
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Extract local files
   *
   * @param {string} archivePath
   * @param {string} outputPath
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async extractFiles({ archivePath, outputPath }) {
    try {
      if (undefinedOrNull(archivePath) || undefinedOrNull(outputPath)) {
        return { error: `Invalid paths.`, stderr: null, data: null };
      }

      // Request usage access
      const _accessGranted = await this._requestUsageAccess({ filePath: archivePath });
      if (!_accessGranted) {
        return { data: null, error: 'Permission denied', stderr: null };
      }

      // Create output directory if it doesn't exist
      await this._mkdir({ filePath: outputPath });

      // Use unzip command on macOS
      const command = `unzip "${archivePath}" -d "${outputPath}"`;

      return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(command, (error, stdout, stderr) => {
          if (error) {
            log.error(`${error}`, `FileExplorerLocalDataSource.extractFiles -> unzip error`);
            return resolve({ error, stderr, data: false });
          }
          return resolve({ error: null, stderr: null, data: true });
        });
      });
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Batch convert local files
   *
   * @param {array} fileList
   * @param {string} outputFormat
   * @param {string} outputPath
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchConvertFiles({ fileList, outputFormat, outputPath }) {
    try {
      if (!fileList || fileList.length < 1) {
        return { error: `No files selected.`, stderr: null, data: null };
      }

      if (undefinedOrNull(outputFormat) || undefinedOrNull(outputPath)) {
        return { error: `Invalid output format or path.`, stderr: null, data: null };
      }

      // Request usage access for the first file's directory
      if (fileList.length > 0) {
        const _accessGranted = await this._requestUsageAccess({ filePath: fileList[0] });
        if (!_accessGranted) {
          return { data: null, error: 'Permission denied', stderr: null };
        }
      }

      // Create output directory if it doesn't exist
      await this._mkdir({ filePath: outputPath });

      const results = [];

      for (let i = 0; i < fileList.length; i += 1) {
        const filePath = fileList[i];
        const fileInfo = require('path').parse(filePath);
        const outputFilename = `${fileInfo.name}.${outputFormat}`;
        const outputFilePath = require('path').join(outputPath, outputFilename);

        // Use sips command on macOS for image conversion
        let command;
        if (['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'].includes(outputFormat.toLowerCase())) {
          command = `sips -s format ${outputFormat.toLowerCase()} "${filePath}" --out "${outputFilePath}"`;
        } else {
          // For other formats, return error
          results.push({
            filePath,
            success: false,
            error: `Unsupported output format: ${outputFormat}`
          });
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const { error, stderr } = await new Promise((resolve) => {
          const { exec } = require('child_process');
          exec(command, (error, stdout, stderr) => {
            resolve({ error, stderr });
          });
        });

        if (error) {
          log.error(`${error}`, `FileExplorerLocalDataSource.batchConvertFiles -> sips error`);
          results.push({
            filePath,
            success: false,
            error: error.message
          });
        } else {
          results.push({
            filePath,
            success: true,
            outputFilePath,
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
   * description - Sync folders
   *
   * @param {string} sourcePath
   * @param {string} destinationPath
   * @param {string} syncType - 'one-way' or 'two-way'
   * @param {boolean} incremental - whether to do incremental sync
   * @param {errorCallback} onError
   * @param {progressCallback} onProgress
   * @param {completedCallback} onCompleted
   * @return {Promise<{data: object|null, error: string|null, stderr: string|null}>}
   */
  async syncFolders({
    sourcePath,
    destinationPath,
    syncType,
    incremental,
    onError,
    onProgress,
    onCompleted,
  }) {
    try {
      // Request usage access
      const _accessGranted = await this._requestUsageAccess({ filePath: sourcePath });
      if (!_accessGranted) {
        return { data: null, error: 'Permission denied', stderr: null };
      }

      const _destAccessGranted = await this._requestUsageAccess({ filePath: destinationPath });
      if (!_destAccessGranted) {
        return { data: null, error: 'Permission denied for destination', stderr: null };
      }

      // Create destination directory if it doesn't exist
      await this._mkdir({ filePath: destinationPath });

      // Get files from source and destination
      const sourceFiles = await this._getAllFiles(sourcePath);
      const destinationFiles = await this._getAllFiles(destinationPath);

      // Determine files to sync
      let filesToSync = [];
      
      if (syncType === 'one-way') {
        filesToSync = this._determineOneWaySyncFiles(sourceFiles, destinationFiles, incremental);
      } else if (syncType === 'two-way') {
        filesToSync = this._determineTwoWaySyncFiles(sourceFiles, destinationFiles, incremental);
      } else {
        return { data: null, error: 'Invalid sync type', stderr: null };
      }

      // Execute sync
      let syncedCount = 0;
      const totalFiles = filesToSync.length;

      for (let i = 0; i < filesToSync.length; i += 1) {
        const { sourceFile, destinationFile, direction } = filesToSync[i];
        
        try {
          if (direction === 'source-to-dest') {
            await this._copyFile(sourceFile, destinationFile);
          } else if (direction === 'dest-to-source') {
            await this._copyFile(destinationFile, sourceFile);
          }
          
          syncedCount++;
          
          // Update progress
          if (onProgress) {
            onProgress({
              current: syncedCount,
              total: totalFiles,
              file: sourceFile,
            });
          }
        } catch (error) {
          if (onError) {
            onError(error);
          }
          log.error(error, `FileExplorerLocalDataSource.syncFolders -> copy error`);
        }
      }

      if (onCompleted) {
        onCompleted({
          synced: syncedCount,
          total: totalFiles,
        });
      }

      return { 
        error: null, 
        stderr: null, 
        data: {
          synced: syncedCount,
          total: totalFiles,
        }
      };
    } catch (e) {
      log.error(e);
      if (onError) {
        onError(e);
      }
      return { error: e, stderr: null, data: false };
    }
  }

  /**
   * description - Get all files recursively
   *
   * @param {string} directory
   * @return {Promise<array>}
   * @private
   */
  async _getAllFiles(directory) {
    const files = [];
    
    async function traverse(currentDir) {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else if (entry.isFile()) {
          const stat = await fs.promises.stat(fullPath);
          files.push({
            path: fullPath,
            relativePath: path.relative(directory, fullPath),
            size: stat.size,
            mtime: stat.mtime.getTime(),
          });
        }
      }
    }
    
    await traverse(directory);
    return files;
  }

  /**
   * description - Determine files for one-way sync
   *
   * @param {array} sourceFiles
   * @param {array} destinationFiles
   * @param {boolean} incremental
   * @return {array}
   * @private
   */
  _determineOneWaySyncFiles(sourceFiles, destinationFiles, incremental) {
    const filesToSync = [];
    const destinationMap = new Map(destinationFiles.map(f => [f.relativePath, f]));
    
    for (const sourceFile of sourceFiles) {
      const destFile = destinationMap.get(sourceFile.relativePath);
      
      if (!destFile || (!incremental || sourceFile.mtime > destFile.mtime || sourceFile.size !== destFile.size)) {
        const destPath = path.join(path.dirname(destinationFiles[0]?.path || ''), sourceFile.relativePath);
        filesToSync.push({
          sourceFile: sourceFile.path,
          destinationFile: destPath,
          direction: 'source-to-dest',
        });
      }
    }
    
    return filesToSync;
  }

  /**
   * description - Determine files for two-way sync
   *
   * @param {array} sourceFiles
   * @param {array} destinationFiles
   * @param {boolean} incremental
   * @return {array}
   * @private
   */
  _determineTwoWaySyncFiles(sourceFiles, destinationFiles, incremental) {
    const filesToSync = [];
    const sourceMap = new Map(sourceFiles.map(f => [f.relativePath, f]));
    const destinationMap = new Map(destinationFiles.map(f => [f.relativePath, f]));
    
    // Check source files
    for (const sourceFile of sourceFiles) {
      const destFile = destinationMap.get(sourceFile.relativePath);
      
      if (!destFile || (!incremental || sourceFile.mtime > destFile.mtime)) {
        const destPath = path.join(path.dirname(destinationFiles[0]?.path || ''), sourceFile.relativePath);
        filesToSync.push({
          sourceFile: sourceFile.path,
          destinationFile: destPath,
          direction: 'source-to-dest',
        });
      }
    }
    
    // Check destination files
    for (const destFile of destinationFiles) {
      const sourceFile = sourceMap.get(destFile.relativePath);
      
      if (!sourceFile || (!incremental || destFile.mtime > sourceFile.mtime)) {
        const sourcePath = path.join(path.dirname(sourceFiles[0]?.path || ''), destFile.relativePath);
        filesToSync.push({
          sourceFile: destFile.path,
          destinationFile: sourcePath,
          direction: 'dest-to-source',
        });
      }
    }
    
    return filesToSync;
  }

  /**
   * description - Copy file
   *
   * @param {string} source
   * @param {string} destination
   * @return {Promise}
   * @private
   */
  async _copyFile(source, destination) {
    // Create directory if it doesn't exist
    const destDir = path.dirname(destination);
    await this._mkdir({ filePath: destDir });
    
    // Copy file
    await fs.promises.copyFile(source, destination);
  }

  /**
   * description - Schedule sync task
   *
   * @param {object} taskConfig - task configuration
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async scheduleSyncTask(taskConfig) {
    try {
      // For now, we'll just store the task in memory
      // In a real implementation, we would store this in a database or file
      const taskId = `sync-task-${Date.now()}`;
      
      // Simulate scheduling
      log.info(`Scheduled sync task: ${taskId}`, taskConfig);
      
      return { error: null, stderr: null, data: taskId };
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
      // For now, return empty array
      // In a real implementation, we would retrieve tasks from storage
      return { error: null, stderr: null, data: [] };
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
      // For now, just log the cancellation
      // In a real implementation, we would remove the task from storage
      log.info(`Cancelled sync task: ${taskId}`);
      
      return { error: null, stderr: null, data: true };
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
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async searchFiles({ searchTerm, filePath, filters }) {
    try {
      // Request usage access
      const _accessGranted = await this._requestUsageAccess({ filePath });
      if (!_accessGranted) {
        return { data: null, error: 'Permission denied', stderr: null };
      }

      // Get all files recursively
      const allFiles = await this._getAllFiles(filePath);

      // Filter files based on search term and filters
      const filteredFiles = allFiles.filter(file => {
        // Search by name
        const matchesSearchTerm = file.path.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply filters
        let matchesFilters = true;
        
        // File type filter
        if (filters.fileType && filters.fileType.length > 0) {
          const fileExtension = path.extname(file.path).toLowerCase().slice(1);
          matchesFilters = filters.fileType.includes(fileExtension);
        }
        
        // Size filter
        if (matchesFilters && filters.size) {
          const { min, max } = filters.size;
          if (min && file.size < min) matchesFilters = false;
          if (max && file.size > max) matchesFilters = false;
        }
        
        // Date filter
        if (matchesFilters && filters.date) {
          const { from, to } = filters.date;
          if (from && file.mtime < from) matchesFilters = false;
          if (to && file.mtime > to) matchesFilters = false;
        }
        
        return matchesSearchTerm && matchesFilters;
      });

      // Convert to the expected format
      const formattedResults = filteredFiles.map(file => ({
        name: path.basename(file.path),
        path: file.path,
        extension: path.extname(file.path),
        size: file.size,
        isFolder: false,
        dateAdded: appDateFormat(new Date(file.mtime)),
        symlink: null,
      }));

      return { error: null, stderr: null, data: formattedResults };
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
      // For now, we'll just store the criteria in memory
      // In a real implementation, we would store this in a database or file
      const criteriaId = `search-criteria-${Date.now()}`;
      
      // Simulate saving
      log.info(`Saved search criteria: ${criteriaId}`, criteria);
      
      return { error: null, stderr: null, data: criteriaId };
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
      // For now, return empty array
      // In a real implementation, we would retrieve criteria from storage
      return { error: null, stderr: null, data: [] };
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
      // For now, just log the deletion
      // In a real implementation, we would remove the criteria from storage
      log.info(`Deleted search criteria: ${criteriaId}`);
      
      return { error: null, stderr: null, data: true };
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
      // For now, we'll just store the bookmark in memory
      // In a real implementation, we would store this in a database or file
      const bookmarkId = `bookmark-${Date.now()}`;
      
      // Simulate saving
      log.info(`Added bookmark: ${bookmarkId}`, { deviceType, path, name, storageId });
      
      return { error: null, stderr: null, data: bookmarkId };
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
      // For now, return empty array
      // In a real implementation, we would retrieve bookmarks from storage
      return { error: null, stderr: null, data: [] };
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
      // For now, just log the deletion
      // In a real implementation, we would remove the bookmark from storage
      log.info(`Deleted bookmark: ${bookmarkId}`);
      
      return { error: null, stderr: null, data: true };
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
      // For now, just log the update
      // In a real implementation, we would update the bookmark in storage
      log.info(`Updated bookmark: ${bookmarkId}`, updates);
      
      return { error: null, stderr: null, data: true };
    } catch (e) {
      log.error(e);
      return { error: e, stderr: null, data: false };
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
      if (!existsSync(filePath)) {
        onError({
          error: `File not found: ${filePath}`,
          stderr: null,
          data: null,
        });
        return { data: false, error: `File not found: ${filePath}`, stderr: null };
      }

      const fileName = path.basename(filePath);
      const directory = path.dirname(filePath);
      const encryptedFilePath = path.join(directory, `${fileName}.protected`);

      await encryptionService.encryptFile(filePath, encryptedFilePath, password);
      
      // Delete original file
      fs.unlinkSync(filePath);

      onCompleted();
      return { data: true, error: null, stderr: null };
    } catch (e) {
      log.error(e, `FileExplorerLocalDataSource -> passwordProtectFile`);
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
      if (!existsSync(filePath)) {
        onError({
          error: `File not found: ${filePath}`,
          stderr: null,
          data: null,
        });
        return { data: false, error: `File not found: ${filePath}`, stderr: null };
      }

      const fileName = path.basename(filePath);
      const decryptedFileName = fileName.replace('.protected', '');
      const decryptedFilePath = path.join(destinationPath, decryptedFileName);

      await encryptionService.decryptFile(filePath, decryptedFilePath, password);

      onCompleted();
      return { data: true, error: null, stderr: null };
    } catch (e) {
      log.error(e, `FileExplorerLocalDataSource -> unlockProtectedFile`);
      onError({
        error: e.message,
        stderr: null,
        data: null,
      });
      return { data: false, error: e.message, stderr: null };
    }
  }
}
