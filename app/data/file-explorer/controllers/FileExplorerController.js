import { FileExplorerRepository } from '../repositories/FileExplorerRepository';
import transferQueueManager from '../services/TransferQueueManager';
import encryptionService from '../../../services/EncryptionService';
import auditLogService from '../../../services/AuditLogService';
import { checkIf } from '../../../utils/checkIf';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import {
  processLocalBuffer,
  processMtpBuffer,
} from '../../../helpers/processBufferOutput';
import { getMtpModeSetting } from '../../../helpers/settings';
import { DEVICE_TYPE } from '../../../enums';
import { unixTimestampNow } from '../../../utils/date';

class FileExplorerController {
  constructor() {
    this.repository = new FileExplorerRepository();
  }

  async _sentEvent({ result, deviceType, eventKey, attachData = false }) {
    checkIf(eventKey, 'string');
    checkIf(attachData, 'boolean');
    checkIf(deviceType, 'inObjectValues', DEVICE_TYPE);

    // events related to local disk actions
    if (deviceType === DEVICE_TYPE.local) {
      const { error: localError } = await processLocalBuffer({
        error: result?.error,
        stderr: result?.stderr,
      });

      if (localError) {
        const _eventKey = `${EVENT_TYPE[`LOCAL_${eventKey}_ERROR`]}`;

        // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
        if (!_eventKey) {
          return;
        }

        // send out an error event
        await analyticsService.sendEvent(_eventKey, {
          time: unixTimestampNow(),
          stderr: result?.stderr,
          error: result?.error,
        });

        return;
      }

      const _eventKey = `${EVENT_TYPE[`LOCAL_${eventKey}_SUCCESS`]}`;

      // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
      if (!_eventKey) {
        return;
      }

      // send a success event
      let data = {};

      if (attachData) {
        data = {
          data: result?.data,
        };
      }

      await analyticsService.sendEvent(_eventKey, {
        time: unixTimestampNow(),
        ...data,
      });

      return;
    }

    // events related to mtp actions
    const mtpMode = getMtpModeSetting();
    const { mtpStatus, error: mtpError } = await processMtpBuffer({
      error: result?.error,
      stderr: result?.stderr,
      mtpMode,
    });

    if (mtpError) {
      const _eventKey = `${EVENT_TYPE[`MTP_${eventKey}_ERROR`]}`;

      // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
      if (!_eventKey) {
        return;
      }

      // send out an error event
      await analyticsService.sendEvent(_eventKey, {
        time: unixTimestampNow(),
        'MTP Status': mtpStatus,
        'MTP Mode': mtpMode,
        stderr: result?.stderr,
        error: result?.error,
      });

      return;
    }

    const _eventKey = `${EVENT_TYPE[`MTP_${eventKey}_SUCCESS`]}`;

    // if the event key is not listed in the [EVENT_TYPE] object then don't proceed
    if (!_eventKey) {
      return;
    }

    // send a success event
    let data = {};

    if (attachData) {
      data = {
        data: result?.data,
      };
    }

    await analyticsService.sendEvent(_eventKey, {
      time: unixTimestampNow(),
      'MTP Status': mtpStatus,
      'MTP Mode': mtpMode,
      ...data,
    });
  }

  /**
   * description - Initialize
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.initialize({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'INITIALIZE' });

    return result;
  }

  /**
   * description - Dispose
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async dispose({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.dispose({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'DISPOSE' });

    return result;
  }

  /**
   * description - Fetch storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.listStorages({ deviceType });

    this._sentEvent({
      result,
      deviceType,
      eventKey: 'LIST_STORAGES',
      attachData: true,
    });

    return result;
  }

  /**
   * description - Fetch files in the path
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} ignoreHidden
   * @param {string} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(ignoreHidden, 'boolean');

    const result = await this.repository.listFiles({
      deviceType,
      filePath,
      ignoreHidden,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'LIST_FILES' });

    return result;
  }

  /**
   * description - Rename a file
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} newFilename
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(newFilename, 'string');

    const result = await this.repository.renameFile({
      deviceType,
      filePath,
      newFilename,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'RENAME_FILE' });

    // Log audit entry
    auditLogService.logOperation('rename', filePath, deviceType, `New name: ${newFilename}`);

    return result;
  }

  /**
   * description - Delete files
   *
   * @param {string} deviceType
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ deviceType, fileList, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');

    const result = await this.repository.deleteFiles({
      deviceType,
      fileList,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'DELETE_FILE' });

    // Log audit entries for each deleted file
    fileList.forEach(filePath => {
      auditLogService.logOperation('delete', filePath, deviceType);
    });

    return result;
  }

  /**
   * description - Create a directory
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ deviceType, filePath, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');

    const result = await this.repository.makeDirectory({
      deviceType,
      filePath,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'NEW_FOLDER' });

    // Log audit entry
    auditLogService.logOperation('create_directory', filePath, deviceType);

    return result;
  }

  /**
   * description - Check if files exist
   *
   * @param {string} deviceType
   * @param {[string]} fileList
   * @param {string} storageId
   * @return {Promise<boolean>}
   */
  async filesExist({ deviceType, fileList, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');

    const result = await this.repository.filesExist({
      deviceType,
      fileList,
      storageId,
    });

    this._sentEvent({ result, deviceType, eventKey: 'FILES_EXIST' });

    return result;
  }

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
  transferFiles = ({
    deviceType,
    destination,
    fileList,
    direction,
    storageId,
    onError,
    onPreprocess,
    onProgress,
    onCompleted,
  }) => {
    checkIf(deviceType, 'string');
    checkIf(destination, 'string');
    checkIf(direction, 'string');
    checkIf(fileList, 'array');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    // Add task to transfer queue
    const taskId = transferQueueManager.addTask({
      deviceType,
      destination,
      fileList,
      direction,
      storageId,
      onError,
      onPreprocess,
      onProgress,
      onCompleted,
      transferFiles: this.repository.transferFiles.bind(this.repository),
    });

    this._sentEvent({ result: { data: taskId }, deviceType, eventKey: 'TRANSFER_FILES' });

    // Log audit entries for each transferred file
    fileList.forEach(filePath => {
      auditLogService.logOperation(
        direction === 'upload' ? 'upload' : 'download',
        filePath,
        deviceType,
        `Destination: ${destination}`
      );
    });

    return { data: taskId, error: null, stderr: null };
  };

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
  transferFilesWithEncryption = ({
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
  }) => {
    checkIf(deviceType, 'string');
    checkIf(destination, 'string');
    checkIf(direction, 'string');
    checkIf(fileList, 'array');
    checkIf(password, 'string');
    checkIf(onError, 'function');
    checkIf(onPreprocess, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    // Add task to transfer queue with encryption
    const taskId = transferQueueManager.addTask({
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
      transferFiles: this.repository.transferFilesWithEncryption.bind(this.repository),
    });

    this._sentEvent({ result: { data: taskId }, deviceType, eventKey: 'TRANSFER_FILES_WITH_ENCRYPTION' });

    // Log audit entries for each encrypted transfer
    fileList.forEach(filePath => {
      auditLogService.logOperation(
        direction === 'upload' ? 'upload_encrypted' : 'download_encrypted',
        filePath,
        deviceType,
        `Destination: ${destination} (Encrypted)`
      );
    });

    return { data: taskId, error: null, stderr: null };
  };

  /**
   * description - Password protect a file
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} password
   * @param {errorCallback} onError
   * @param {completedCallback} onCompleted
   *
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async passwordProtectFile({
    deviceType,
    filePath,
    password,
    onError,
    onCompleted,
  }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(password, 'string');
    checkIf(onError, 'function');
    checkIf(onCompleted, 'function');

    const result = await this.repository.passwordProtectFile({
      deviceType,
      filePath,
      password,
      onError,
      onCompleted,
    });

    this._sentEvent({ result, deviceType, eventKey: 'PASSWORD_PROTECT_FILE' });

    // Log audit entry
    auditLogService.logOperation('password_protect', filePath, deviceType);

    return result;
  }

  /**
   * description - Unlock a password-protected file
   *
   * @param {string} deviceType
   * @param {string} filePath
   * @param {string} password
   * @param {string} destinationPath
   * @param {errorCallback} onError
   * @param {completedCallback} onCompleted
   *
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async unlockProtectedFile({
    deviceType,
    filePath,
    password,
    destinationPath,
    onError,
    onCompleted,
  }) {
    checkIf(deviceType, 'string');
    checkIf(filePath, 'string');
    checkIf(password, 'string');
    checkIf(destinationPath, 'string');
    checkIf(onError, 'function');
    checkIf(onCompleted, 'function');

    const result = await this.repository.unlockProtectedFile({
      deviceType,
      filePath,
      password,
      destinationPath,
      onError,
      onCompleted,
    });

    this._sentEvent({ result, deviceType, eventKey: 'UNLOCK_PROTECTED_FILE' });

    // Log audit entry
    auditLogService.logOperation('unlock', filePath, deviceType, `Destination: ${destinationPath}`);

    return result;
  }

  /**
   * description - Pause a transfer task
   *
   * @param {string} taskId - task ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async pauseTransferTask(taskId) {
    checkIf(taskId, 'string');

    const result = transferQueueManager.pauseTask(taskId);

    this._sentEvent({ result: { data: result }, deviceType: DEVICE_TYPE.local, eventKey: 'PAUSE_TRANSFER_TASK' });

    return { data: result, error: null, stderr: null };
  }

  /**
   * description - Resume a transfer task
   *
   * @param {string} taskId - task ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async resumeTransferTask(taskId) {
    checkIf(taskId, 'string');

    const result = transferQueueManager.resumeTask(taskId);

    this._sentEvent({ result: { data: result }, deviceType: DEVICE_TYPE.local, eventKey: 'RESUME_TRANSFER_TASK' });

    return { data: result, error: null, stderr: null };
  }

  /**
   * description - Cancel a transfer task
   *
   * @param {string} taskId - task ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async cancelTransferTask(taskId) {
    checkIf(taskId, 'string');

    const result = transferQueueManager.cancelTask(taskId);

    this._sentEvent({ result: { data: result }, deviceType: DEVICE_TYPE.local, eventKey: 'CANCEL_TRANSFER_TASK' });

    return { data: result, error: null, stderr: null };
  }

  /**
   * description - Get transfer queue
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async getTransferQueue() {
    const result = transferQueueManager.getQueue();

    this._sentEvent({ result: { data: result }, deviceType: DEVICE_TYPE.local, eventKey: 'GET_TRANSFER_QUEUE' });

    return { data: result, error: null, stderr: null };
  }

  /**
   * description - Get transfer history
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async getTransferHistory() {
    const result = transferQueueManager.getHistory();

    this._sentEvent({ result: { data: result }, deviceType: DEVICE_TYPE.local, eventKey: 'GET_TRANSFER_HISTORY' });

    return { data: result, error: null, stderr: null };
  }

  /**
   * description: fetch the data for generating bug/error reports
   *
   * @param {string} deviceType
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async fetchDebugReport({ deviceType }) {
    checkIf(deviceType, 'string');

    const result = await this.repository.fetchDebugReport({ deviceType });

    this._sentEvent({ result, deviceType, eventKey: 'FETCH_DEBUG_REPORT' });

    return result;
  }

  /**
   * description - Batch rename files
   *
   * @param {string} deviceType
   * @param {array} fileList - array of { filePath, newFilename } objects
   * @param {string} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchRenameFiles({ deviceType, fileList, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');

    const result = await this.repository.batchRenameFiles({ deviceType, fileList, storageId });

    this._sentEvent({ result, deviceType, eventKey: 'BATCH_RENAME_FILES' });

    // Log audit entries for each renamed file
    fileList.forEach(({ filePath, newFilename }) => {
      auditLogService.logOperation('rename', filePath, deviceType, `New name: ${newFilename}`);
    });

    return result;
  }

  /**
   * description - Compress files
   *
   * @param {string} deviceType
   * @param {array} fileList
   * @param {string} outputPath
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async compressFiles({ deviceType, fileList, outputPath, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');
    checkIf(outputPath, 'string');

    const result = await this.repository.compressFiles({ deviceType, fileList, outputPath, storageId });

    this._sentEvent({ result, deviceType, eventKey: 'COMPRESS_FILES' });

    // Log audit entry for compression
    auditLogService.logOperation('compress', outputPath, deviceType, `Files: ${fileList.length} files`);

    return result;
  }

  /**
   * description - Extract files
   *
   * @param {string} deviceType
   * @param {string} archivePath
   * @param {string} outputPath
   * @param {string} storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async extractFiles({ deviceType, archivePath, outputPath, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(archivePath, 'string');
    checkIf(outputPath, 'string');

    const result = await this.repository.extractFiles({ deviceType, archivePath, outputPath, storageId });

    this._sentEvent({ result, deviceType, eventKey: 'EXTRACT_FILES' });

    // Log audit entry for extraction
    auditLogService.logOperation('extract', archivePath, deviceType, `Destination: ${outputPath}`);

    return result;
  }

  /**
   * description - Batch convert files
   *
   * @param {string} deviceType
   * @param {array} fileList
   * @param {string} outputFormat
   * @param {string} outputPath
   * @param {string} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchConvertFiles({ deviceType, fileList, outputFormat, outputPath, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(fileList, 'array');
    checkIf(outputFormat, 'string');
    checkIf(outputPath, 'string');

    const result = await this.repository.batchConvertFiles({ deviceType, fileList, outputFormat, outputPath, storageId });

    this._sentEvent({ result, deviceType, eventKey: 'BATCH_CONVERT_FILES' });

    // Log audit entry for batch conversion
    auditLogService.logOperation('convert', outputPath, deviceType, `Format: ${outputFormat}, Files: ${fileList.length} files`);

    return result;
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
    checkIf(sourceDeviceType, 'string');
    checkIf(sourcePath, 'string');
    checkIf(destinationDeviceType, 'string');
    checkIf(destinationPath, 'string');
    checkIf(syncType, 'string');
    checkIf(incremental, 'boolean');
    checkIf(onError, 'function');
    checkIf(onProgress, 'function');
    checkIf(onCompleted, 'function');

    const result = await this.repository.syncFolders({
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
    });

    this._sentEvent({ result, deviceType: sourceDeviceType, eventKey: 'SYNC_FOLDERS' });

    // Log audit entry for folder sync
    auditLogService.logOperation(
      'sync',
      sourcePath,
      sourceDeviceType,
      `Destination: ${destinationPath}, Type: ${syncType}, Incremental: ${incremental}`
    );

    return result;
  }

  /**
   * description - Schedule sync task
   *
   * @param {object} taskConfig - task configuration
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async scheduleSyncTask(taskConfig) {
    checkIf(taskConfig, 'object');

    const result = await this.repository.scheduleSyncTask(taskConfig);

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'SCHEDULE_SYNC_TASK' });

    return result;
  }

  /**
   * description - List scheduled sync tasks
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listSyncTasks() {
    const result = await this.repository.listSyncTasks();

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'LIST_SYNC_TASKS' });

    return result;
  }

  /**
   * description - Cancel scheduled sync task
   *
   * @param {string} taskId - task ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async cancelSyncTask(taskId) {
    checkIf(taskId, 'string');

    const result = await this.repository.cancelSyncTask(taskId);

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'CANCEL_SYNC_TASK' });

    return result;
  }

  /**
   * description - Search files
   *
   * @param {string} deviceType
   * @param {string} searchTerm
   * @param {string} filePath
   * @param {object} filters - file type, size, date filters
   * @param {string} storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async searchFiles({ deviceType, searchTerm, filePath, filters, storageId }) {
    checkIf(deviceType, 'string');
    checkIf(searchTerm, 'string');
    checkIf(filePath, 'string');
    checkIf(filters, 'object');

    const result = await this.repository.searchFiles({ deviceType, searchTerm, filePath, filters, storageId });

    this._sentEvent({ result, deviceType, eventKey: 'SEARCH_FILES' });

    return result;
  }

  /**
   * description - Save search criteria
   *
   * @param {object} criteria - search criteria
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async saveSearchCriteria(criteria) {
    checkIf(criteria, 'object');

    const result = await this.repository.saveSearchCriteria(criteria);

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'SAVE_SEARCH_CRITERIA' });

    return result;
  }

  /**
   * description - List saved search criteria
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listSearchCriteria() {
    const result = await this.repository.listSearchCriteria();

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'LIST_SEARCH_CRITERIA' });

    return result;
  }

  /**
   * description - Delete saved search criteria
   *
   * @param {string} criteriaId - criteria ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async deleteSearchCriteria(criteriaId) {
    checkIf(criteriaId, 'string');

    const result = await this.repository.deleteSearchCriteria(criteriaId);

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'DELETE_SEARCH_CRITERIA' });

    return result;
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
    checkIf(deviceType, 'string');
    checkIf(path, 'string');
    checkIf(name, 'string');

    const result = await this.repository.addBookmark({ deviceType, path, name, storageId });

    this._sentEvent({ result, deviceType, eventKey: 'ADD_BOOKMARK' });

    return result;
  }

  /**
   * description - List bookmarks
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listBookmarks() {
    const result = await this.repository.listBookmarks();

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'LIST_BOOKMARKS' });

    return result;
  }

  /**
   * description - Delete bookmark
   *
   * @param {string} bookmarkId - bookmark ID
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async deleteBookmark(bookmarkId) {
    checkIf(bookmarkId, 'string');

    const result = await this.repository.deleteBookmark(bookmarkId);

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'DELETE_BOOKMARK' });

    return result;
  }

  /**
   * description - Update bookmark
   *
   * @param {string} bookmarkId - bookmark ID
   * @param {object} updates - updates to apply
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async updateBookmark(bookmarkId, updates) {
    checkIf(bookmarkId, 'string');
    checkIf(updates, 'object');

    const result = await this.repository.updateBookmark(bookmarkId, updates);

    this._sentEvent({ result, deviceType: DEVICE_TYPE.local, eventKey: 'UPDATE_BOOKMARK' });

    return result;
  }
}

const fileExplorerController = new FileExplorerController();

export default fileExplorerController;
