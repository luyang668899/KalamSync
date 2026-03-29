import { FileExplorerLegacyDataSource } from '../data-sources/FileExplorerLegacyDataSource';
import { FileExplorerLocalDataSource } from '../data-sources/FileExplorerLocalDataSource';
import { FileExplorerKalamDataSource } from '../data-sources/FileExplorerKalamDataSource';
import { DEVICE_TYPE, MTP_MODE } from '../../../enums';
import { checkIf } from '../../../utils/checkIf';
import { getMtpModeSetting } from '../../../helpers/settings';

export class FileExplorerRepository {
  constructor() {
    this.legacyMtpDataSource = new FileExplorerLegacyDataSource();
    this.localDataSource = new FileExplorerLocalDataSource();
    this.kalamMtpDataSource = new FileExplorerKalamDataSource();
  }

  /**
   * description - Initialize
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async initialize({ deviceType }) {
    const selectedMtpMode = getMtpModeSetting();

    checkIf(deviceType, 'string');

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          throw `initialize for MTP_MODE.legacy is unimplemented`;

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.initialize();
      }
    }

    throw `initialize for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Dispose
   *
   * @return {Promise<{data: object, error: string|null, stderr: string|null}>}
   */
  async dispose({ deviceType }) {
    checkIf(deviceType, 'string');

    const selectedMtpMode = getMtpModeSetting();

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return;

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.dispose();
      }
    }

    throw `dispose for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Fetch storages
   *
   * @return {Promise<{data: object|boolean, error: string|null, stderr: string|null}>}
   */
  async listStorages({ deviceType }) {
    const selectedMtpMode = getMtpModeSetting();

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.listStorages();

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.listStorages();
      }
    }

    throw `listStorages for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Fetch files in the path
   *
   * @param deviceType
   * @param filePath
   * @param ignoreHidden
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listFiles({ deviceType, filePath, ignoreHidden, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.listFiles({
            filePath,
            ignoreHidden,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.listFiles({
            filePath,
            ignoreHidden,
            storageId,
          });
      }
    }

    return this.localDataSource.listFiles({
      filePath,
      ignoreHidden,
    });
  }

  /**
   * description - Rename a file
   *
   * @param deviceType
   * @param filePath
   * @param newFilename
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async renameFile({ deviceType, filePath, newFilename, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.renameFile({
            filePath,
            newFilename,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.renameFile({
            filePath,
            newFilename,
            storageId,
          });
      }
    }

    return this.localDataSource.renameFile({
      filePath,
      newFilename,
    });
  }

  /**
   * description - Delete files
   *
   * @param deviceType
   * @param fileList
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async deleteFiles({ deviceType, fileList, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.deleteFiles({
            fileList,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.deleteFiles({
            fileList,
            storageId,
          });
      }
    }

    return this.localDataSource.deleteFiles({
      fileList,
    });
  }

  /**
   * description - Create a directory
   *
   * @param deviceType
   * @param filePath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async makeDirectory({ deviceType, filePath, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.makeDirectory({
            filePath,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.makeDirectory({
            filePath,
            storageId,
          });
      }
    }

    return this.localDataSource.makeDirectory({
      filePath,
    });
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
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.filesExist({
            fileList,
            storageId,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.filesExist({
            fileList,
            storageId,
          });
      }
    }

    return this.localDataSource.filesExist({
      fileList,
    });
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
   * @param {progressCallback} onProgress
   * @param {preprocessCallback} onPreprocess
   * @param {completedCallback} onCompleted
   *
   * @return
   */
  transferFiles({
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
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');
      checkIf(onPreprocess, 'function');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.transferFiles({
            destination,
            fileList,
            direction,
            storageId,
            onError,
            onProgress,
            onCompleted,
            onPreprocess,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.transferFiles({
            deviceType,
            destination,
            fileList,
            direction,
            storageId,
            onError,
            onProgress,
            onCompleted,
            onPreprocess,
          });
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw `transferFiles for deviceType=DEVICE_TYPE.local is unimplemented`;
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
  transferFilesWithEncryption({
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
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');
      checkIf(onPreprocess, 'function');
      checkIf(password, 'string');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.transferFilesWithEncryption({
            destination,
            fileList,
            direction,
            storageId,
            password,
            onError,
            onProgress,
            onCompleted,
            onPreprocess,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.transferFilesWithEncryption({
            deviceType,
            destination,
            fileList,
            direction,
            storageId,
            password,
            onError,
            onProgress,
            onCompleted,
            onPreprocess,
          });
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw `transferFilesWithEncryption for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description: fetch the data for generating bug/error reports
   *
   * @param {string} deviceType
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async fetchDebugReport({ deviceType }) {
    const selectedMtpMode = getMtpModeSetting();

    if (deviceType === DEVICE_TYPE.mtp) {
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.fetchDebugReport();

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.fetchDebugReport();
      }
    }

    // eslint-disable-next-line no-throw-literal
    throw `fetchDebugReport for deviceType=DEVICE_TYPE.local is unimplemented`;
  }

  /**
   * description - Batch rename files
   *
   * @param deviceType
   * @param fileList - array of { filePath, newFilename } objects
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchRenameFiles({ deviceType, fileList, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.batchRenameFiles({ fileList, storageId });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.batchRenameFiles({ fileList, storageId });
      }
    }

    return this.localDataSource.batchRenameFiles({ fileList });
  }

  /**
   * description - Compress files
   *
   * @param deviceType
   * @param fileList
   * @param outputPath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async compressFiles({ deviceType, fileList, outputPath, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.compressFiles({ fileList, outputPath, storageId });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.compressFiles({ fileList, outputPath, storageId });
      }
    }

    return this.localDataSource.compressFiles({ fileList, outputPath });
  }

  /**
   * description - Extract files
   *
   * @param deviceType
   * @param archivePath
   * @param outputPath
   * @param storageId
   * @return {Promise<{data: null|boolean, error: string|null, stderr: string|null}>}
   */
  async extractFiles({ deviceType, archivePath, outputPath, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.extractFiles({ archivePath, outputPath, storageId });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.extractFiles({ archivePath, outputPath, storageId });
      }
    }

    return this.localDataSource.extractFiles({ archivePath, outputPath });
  }

  /**
   * description - Batch convert files
   *
   * @param deviceType
   * @param fileList
   * @param outputFormat
   * @param outputPath
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async batchConvertFiles({ deviceType, fileList, outputFormat, outputPath, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.batchConvertFiles({ fileList, outputFormat, outputPath, storageId });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.batchConvertFiles({ fileList, outputFormat, outputPath, storageId });
      }
    }

    return this.localDataSource.batchConvertFiles({ fileList, outputFormat, outputPath });
  }

  /**
   * description - Sync folders
   *
   * @param sourceDeviceType
   * @param sourcePath
   * @param destinationDeviceType
   * @param destinationPath
   * @param syncType
   * @param incremental
   * @param sourceStorageId
   * @param destinationStorageId
   * @param onError
   * @param onProgress
   * @param onCompleted
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
    // For sync operations, we need to handle both local and MTP devices
    // This is a simplified implementation that delegates to the appropriate data source
    
    // For now, we'll focus on local-to-local sync
    if (sourceDeviceType === DEVICE_TYPE.local && destinationDeviceType === DEVICE_TYPE.local) {
      return this.localDataSource.syncFolders({
        sourcePath,
        destinationPath,
        syncType,
        incremental,
        onError,
        onProgress,
        onCompleted,
      });
    }
    
    // For MTP-related sync, we'll need to implement it based on the MTP mode
    if (sourceDeviceType === DEVICE_TYPE.mtp || destinationDeviceType === DEVICE_TYPE.mtp) {
      const selectedMtpMode = getMtpModeSetting();
      
      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.syncFolders({
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

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.syncFolders({
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
      }
    }
    
    // eslint-disable-next-line no-throw-literal
    throw `syncFolders for unsupported device types is unimplemented`;
  }

  /**
   * description - Schedule sync task
   *
   * @param taskConfig
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async scheduleSyncTask(taskConfig) {
    return this.localDataSource.scheduleSyncTask(taskConfig);
  }

  /**
   * description - List scheduled sync tasks
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listSyncTasks() {
    return this.localDataSource.listSyncTasks();
  }

  /**
   * description - Cancel scheduled sync task
   *
   * @param taskId
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async cancelSyncTask(taskId) {
    return this.localDataSource.cancelSyncTask(taskId);
  }

  /**
   * description - Search files
   *
   * @param deviceType
   * @param searchTerm
   * @param filePath
   * @param filters
   * @param storageId
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async searchFiles({ deviceType, searchTerm, filePath, filters, storageId }) {
    if (deviceType === DEVICE_TYPE.mtp) {
      checkIf(storageId, 'number');

      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.searchFiles({ searchTerm, filePath, filters, storageId });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.searchFiles({ searchTerm, filePath, filters, storageId });
      }
    }

    return this.localDataSource.searchFiles({ searchTerm, filePath, filters });
  }

  /**
   * description - Save search criteria
   *
   * @param criteria
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async saveSearchCriteria(criteria) {
    return this.localDataSource.saveSearchCriteria(criteria);
  }

  /**
   * description - List saved search criteria
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listSearchCriteria() {
    return this.localDataSource.listSearchCriteria();
  }

  /**
   * description - Delete saved search criteria
   *
   * @param criteriaId
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async deleteSearchCriteria(criteriaId) {
    return this.localDataSource.deleteSearchCriteria(criteriaId);
  }

  /**
   * description - Add bookmark
   *
   * @param deviceType
   * @param path
   * @param name
   * @param storageId
   * @return {Promise<{data: string|null, error: string|null, stderr: string|null}>}
   */
  async addBookmark({ deviceType, path, name, storageId }) {
    return this.localDataSource.addBookmark({ deviceType, path, name, storageId });
  }

  /**
   * description - List bookmarks
   *
   * @return {Promise<{data: array|null, error: string|null, stderr: string|null}>}
   */
  async listBookmarks() {
    return this.localDataSource.listBookmarks();
  }

  /**
   * description - Delete bookmark
   *
   * @param bookmarkId
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async deleteBookmark(bookmarkId) {
    return this.localDataSource.deleteBookmark(bookmarkId);
  }

  /**
   * description - Update bookmark
   *
   * @param bookmarkId
   * @param updates
   * @return {Promise<{data: boolean|null, error: string|null, stderr: string|null}>}
   */
  async updateBookmark(bookmarkId, updates) {
    return this.localDataSource.updateBookmark(bookmarkId, updates);
  }

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
    if (deviceType === DEVICE_TYPE.mtp) {
      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.passwordProtectFile({
            filePath,
            password,
            onError,
            onCompleted,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.passwordProtectFile({
            filePath,
            password,
            onError,
            onCompleted,
          });
      }
    }

    return this.localDataSource.passwordProtectFile({
      filePath,
      password,
      onError,
      onCompleted,
    });
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
    if (deviceType === DEVICE_TYPE.mtp) {
      const selectedMtpMode = getMtpModeSetting();

      switch (selectedMtpMode) {
        case MTP_MODE.legacy:
          return this.legacyMtpDataSource.unlockProtectedFile({
            filePath,
            password,
            destinationPath,
            onError,
            onCompleted,
          });

        case MTP_MODE.kalam:
        default:
          return this.kalamMtpDataSource.unlockProtectedFile({
            filePath,
            password,
            destinationPath,
            onError,
            onCompleted,
          });
      }
    }

    return this.localDataSource.unlockProtectedFile({
      filePath,
      password,
      destinationPath,
      onError,
      onCompleted,
    });
  }
}
