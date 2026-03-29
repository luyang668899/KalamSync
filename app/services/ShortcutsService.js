import { app, ipcMain } from 'electron';
import { log } from '../utils/log';

class ShortcutsService {
  constructor() {
    this.setupUrlScheme();
    this.setupIpcHandlers();
  }

  /**
   * Setup URL scheme for Apple Shortcuts integration
   */
  setupUrlScheme() {
    if (process.platform === 'darwin') {
      // Register URL scheme handler for openmtp://
      app.setAsDefaultProtocolClient('openmtp');

      // Handle URL scheme events
      app.on('open-url', (event, url) => {
        event.preventDefault();
        this.handleUrl(url);
      });
    }
  }

  /**
   * Setup IPC handlers for renderer process
   */
  setupIpcHandlers() {
    ipcMain.on('shortcuts:run', (event, shortcutName, input) => {
      this.runShortcut(shortcutName, input).then((result) => {
        event.reply('shortcuts:run:response', { result, error: null });
      }).catch((error) => {
        event.reply('shortcuts:run:response', { result: null, error: error.message });
      });
    });

    ipcMain.on('shortcuts:list', (event) => {
      const shortcuts = this.getAvailableShortcuts();
      event.reply('shortcuts:list:response', shortcuts);
    });
  }

  /**
   * Handle URL scheme events
   * @param {string} url - The URL to handle
   */
  handleUrl(url) {
    try {
      const urlObj = new URL(url);
      const action = urlObj.pathname.substring(1); // Remove leading slash
      const params = Object.fromEntries(urlObj.searchParams);

      log.info(`ShortcutsService -> handleUrl: action=${action}, params=${JSON.stringify(params)}`);

      switch (action) {
        case 'transfer':
          this.handleTransfer(params);
          break;
        case 'open':
          this.handleOpen(params);
          break;
        case 'export':
          this.handleExport(params);
          break;
        default:
          log.warn(`ShortcutsService -> handleUrl: Unknown action ${action}`);
      }
    } catch (error) {
      log.error(error, `ShortcutsService -> handleUrl`);
    }
  }

  /**
   * Handle transfer action from URL
   * @param {object} params - URL parameters
   */
  handleTransfer(params) {
    const { source, destination, files } = params;
    if (!source || !destination || !files) {
      log.warn('ShortcutsService -> handleTransfer: Missing required parameters');
      return;
    }

    // Parse files parameter (comma-separated list)
    const fileList = files.split(',');

    // Trigger transfer via main window
    const mainWindow = app.mainWindow;
    if (mainWindow) {
      mainWindow.webContents.send('shortcuts:transfer', {
        source,
        destination,
        files: fileList
      });
    }
  }

  /**
   * Handle open action from URL
   * @param {object} params - URL parameters
   */
  handleOpen(params) {
    const { path, deviceType } = params;
    if (!path) {
      log.warn('ShortcutsService -> handleOpen: Missing path parameter');
      return;
    }

    // Trigger open via main window
    const mainWindow = app.mainWindow;
    if (mainWindow) {
      mainWindow.webContents.send('shortcuts:open', {
        path,
        deviceType: deviceType || 'local'
      });
    }
  }

  /**
   * Handle export action from URL
   * @param {object} params - URL parameters
   */
  handleExport(params) {
    const { source, destination } = params;
    if (!source || !destination) {
      log.warn('ShortcutsService -> handleExport: Missing required parameters');
      return;
    }

    // Trigger export via main window
    const mainWindow = app.mainWindow;
    if (mainWindow) {
      mainWindow.webContents.send('shortcuts:export', {
        source,
        destination
      });
    }
  }

  /**
   * Run a shortcut by name
   * @param {string} shortcutName - Name of the shortcut
   * @param {any} input - Input for the shortcut
   * @returns {Promise<any>} - Result of the shortcut
   */
  async runShortcut(shortcutName, input) {
    return new Promise((resolve, reject) => {
      try {
        // Handle different shortcut types
        switch (shortcutName) {
          case 'transfer':
            // Implement transfer logic
            resolve({ success: true, message: 'Transfer started' });
            break;
          case 'open':
            // Implement open logic
            resolve({ success: true, message: 'Path opened' });
            break;
          case 'export':
            // Implement export logic
            resolve({ success: true, message: 'Export started' });
            break;
          default:
            reject(new Error(`Unknown shortcut: ${shortcutName}`));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get available shortcuts
   * @returns {array} - List of available shortcuts
   */
  getAvailableShortcuts() {
    return [
      {
        name: 'transfer',
        description: 'Transfer files between devices',
        parameters: [
          { name: 'source', type: 'string', required: true, description: 'Source path' },
          { name: 'destination', type: 'string', required: true, description: 'Destination path' },
          { name: 'files', type: 'string', required: true, description: 'Comma-separated list of files' }
        ]
      },
      {
        name: 'open',
        description: 'Open a specific path',
        parameters: [
          { name: 'path', type: 'string', required: true, description: 'Path to open' },
          { name: 'deviceType', type: 'string', required: false, description: 'Device type (local or mtp)' }
        ]
      },
      {
        name: 'export',
        description: 'Export files to a location',
        parameters: [
          { name: 'source', type: 'string', required: true, description: 'Source path' },
          { name: 'destination', type: 'string', required: true, description: 'Destination path' }
        ]
      }
    ];
  }

  /**
   * Generate URL for a shortcut
   * @param {string} action - Action to perform
   * @param {object} params - Parameters for the action
   * @returns {string} - Generated URL
   */
  generateShortcutUrl(action, params) {
    const url = new URL('openmtp://' + action);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    return url.toString();
  }

  /**
   * Generate Apple Shortcuts URL for a shortcut
   * @param {string} shortcutName - Name of the shortcut
   * @param {object} input - Input for the shortcut
   * @returns {string} - Generated Apple Shortcuts URL
   */
  generateAppleShortcutUrl(shortcutName, input) {
    const url = new URL('shortcuts://run-shortcut');
    url.searchParams.append('name', shortcutName);
    url.searchParams.append('input', 'text');
    url.searchParams.append('text', JSON.stringify(input));

    return url.toString();
  }
}

const shortcutsService = new ShortcutsService();
export default shortcutsService;