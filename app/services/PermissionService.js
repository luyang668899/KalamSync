import { dialog } from 'electron';
import { log } from '../utils/log';
import macosVersion from 'macos-version';
import { NODE_MAC_PERMISSIONS_MIN_OS } from '../constants';

class PermissionService {
  constructor() {
    this.permissions = {
      fileSystem: {
        desktop: false,
        documents: false,
        downloads: false,
        pictures: false,
        fullDiskAccess: false
      },
      network: {
        internet: true // Default to true as we need internet for updates
      },
      system: {
        notifications: false,
        accessibility: false
      }
    };
  }

  /**
   * Check if the current OS supports node-mac-permissions
   * @returns {boolean}
   */
  _doesOsSupportPermissions() {
    return macosVersion.isGreaterThanOrEqualTo(NODE_MAC_PERMISSIONS_MIN_OS);
  }

  /**
   * Request file system access permission
   * @param {string} type - Type of file system access (desktop, documents, downloads, pictures)
   * @returns {Promise<boolean>}
   */
  async requestFileSystemAccess(type) {
    try {
      if (!this._doesOsSupportPermissions()) {
        return true;
      }

      const { askForFoldersAccess, askForPhotosAccess } = await import('node-mac-permissions');
      const isGrantedString = 'authorized';

      let result;
      switch (type) {
        case 'desktop':
          result = await askForFoldersAccess('desktop');
          break;
        case 'documents':
          result = await askForFoldersAccess('documents');
          break;
        case 'downloads':
          result = await askForFoldersAccess('downloads');
          break;
        case 'pictures':
          result = await askForPhotosAccess();
          break;
        default:
          return false;
      }

      if (!result) {
        return false;
      }

      const granted = result === isGrantedString;
      this.permissions.fileSystem[type] = granted;
      return granted;
    } catch (e) {
      log.error(e, `PermissionService -> requestFileSystemAccess`);
      return false;
    }
  }

  /**
   * Request full disk access permission
   * @returns {Promise<boolean>}
   */
  async requestFullDiskAccess() {
    try {
      if (!this._doesOsSupportPermissions()) {
        return true;
      }

      // Note: node-mac-permissions doesn't support full disk access request directly
      // We need to guide the user to System Preferences
      dialog.showMessageBox({
        type: 'info',
        title: 'Full Disk Access Required',
        message: 'OpenMTP needs Full Disk Access to access all files on your system.',
        detail: 'Please go to System Preferences > Security & Privacy > Privacy > Full Disk Access and add OpenMTP to the list.',
        buttons: ['OK', 'Cancel'],
        defaultId: 0
      });

      // We can't programmatically check if full disk access is granted
      // So we'll return true and let the actual file operations handle any permission errors
      return true;
    } catch (e) {
      log.error(e, `PermissionService -> requestFullDiskAccess`);
      return false;
    }
  }

  /**
   * Request notification permission
   * @returns {Promise<boolean>}
   */
  async requestNotificationPermission() {
    try {
      if (!this._doesOsSupportPermissions()) {
        return true;
      }

      const { askForNotificationsAccess } = await import('node-mac-permissions');
      const isGrantedString = 'authorized';

      const result = await askForNotificationsAccess();
      const granted = result === isGrantedString;
      this.permissions.system.notifications = granted;
      return granted;
    } catch (e) {
      log.error(e, `PermissionService -> requestNotificationPermission`);
      return false;
    }
  }

  /**
   * Request accessibility permission
   * @returns {Promise<boolean>}
   */
  async requestAccessibilityPermission() {
    try {
      if (!this._doesOsSupportPermissions()) {
        return true;
      }

      const { askForAccessibilityAccess } = await import('node-mac-permissions');
      const isGrantedString = 'authorized';

      const result = await askForAccessibilityAccess();
      const granted = result === isGrantedString;
      this.permissions.system.accessibility = granted;
      return granted;
    } catch (e) {
      log.error(e, `PermissionService -> requestAccessibilityPermission`);
      return false;
    }
  }

  /**
   * Check if we have permission to access a specific file path
   * @param {string} filePath - Path to check access for
   * @returns {Promise<boolean>}
   */
  async checkPathAccess(filePath) {
    try {
      if (!this._doesOsSupportPermissions()) {
        return true;
      }

      // This is a simplified check
      // In a real implementation, we would check the actual permissions for the specific path
      const { checkForFoldersAccess, checkForPhotosAccess } = await import('node-mac-permissions');
      const isGrantedString = 'authorized';

      let result;
      if (filePath.includes('Desktop')) {
        result = await checkForFoldersAccess('desktop');
      } else if (filePath.includes('Documents')) {
        result = await checkForFoldersAccess('documents');
      } else if (filePath.includes('Downloads')) {
        result = await checkForFoldersAccess('downloads');
      } else if (filePath.includes('Pictures')) {
        result = await checkForPhotosAccess();
      } else {
        // For other paths, we'll need full disk access
        return this.permissions.fileSystem.fullDiskAccess;
      }

      return result === isGrantedString;
    } catch (e) {
      log.error(e, `PermissionService -> checkPathAccess`);
      return false;
    }
  }

  /**
   * Get the current permission status
   * @returns {object}
   */
  getPermissions() {
    return { ...this.permissions };
  }

  /**
   * Update permission status
   * @param {object} permissions - Updated permissions
   */
  updatePermissions(permissions) {
    this.permissions = { ...this.permissions, ...permissions };
  }
}

const permissionService = new PermissionService();
export default permissionService;