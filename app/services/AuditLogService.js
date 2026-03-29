import fs from 'fs';
import path from 'path';
import { log } from '../utils/log';
import { appDateFormat } from '../utils/date';
import { PATHS } from '../constants';

class AuditLogService {
  constructor() {
    this.logFilePath = path.join(PATHS.appData, 'audit.log');
    this.ensureLogFileExists();
  }

  /**
   * Ensure the log file exists
   */
  ensureLogFileExists() {
    try {
      if (!fs.existsSync(PATHS.appData)) {
        fs.mkdirSync(PATHS.appData, { recursive: true });
      }
      
      if (!fs.existsSync(this.logFilePath)) {
        fs.writeFileSync(this.logFilePath, '');
      }
    } catch (e) {
      log.error(e, `AuditLogService -> ensureLogFileExists`);
    }
  }

  /**
   * Log a file operation
   * @param {string} operation - Type of operation (create, delete, rename, move, copy, etc.)
   * @param {string} filePath - Path to the file
   * @param {string} deviceType - Type of device (local, mtp)
   * @param {string} details - Additional details about the operation
   */
  logOperation(operation, filePath, deviceType, details = '') {
    try {
      const timestamp = new Date().toISOString();
      const formattedTime = appDateFormat(new Date());
      const logEntry = {
        timestamp,
        time: formattedTime,
        operation,
        filePath,
        deviceType,
        details
      };

      const logString = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFilePath, logString);
    } catch (e) {
      log.error(e, `AuditLogService -> logOperation`);
    }
  }

  /**
   * Get audit logs
   * @param {number} limit - Maximum number of logs to return
   * @param {string} filter - Filter by operation type
   * @returns {array} - Array of audit log entries
   */
  getLogs(limit = 100, filter = null) {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return [];
      }

      const logContent = fs.readFileSync(this.logFilePath, 'utf8');
      const logLines = logContent.trim().split('\n');
      const logs = [];

      for (const line of logLines) {
        try {
          const logEntry = JSON.parse(line);
          if (!filter || logEntry.operation === filter) {
            logs.push(logEntry);
          }
        } catch (e) {
          // Skip invalid log entries
          log.error(e, `AuditLogService -> getLogs - parsing error`);
        }
      }

      // Return most recent logs first
      return logs.reverse().slice(0, limit);
    } catch (e) {
      log.error(e, `AuditLogService -> getLogs`);
      return [];
    }
  }

  /**
   * Clear audit logs
   * @returns {boolean} - Success status
   */
  clearLogs() {
    try {
      fs.writeFileSync(this.logFilePath, '');
      return true;
    } catch (e) {
      log.error(e, `AuditLogService -> clearLogs`);
      return false;
    }
  }

  /**
   * Get log file size
   * @returns {number} - Size in bytes
   */
  getLogFileSize() {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return 0;
      }

      const stats = fs.statSync(this.logFilePath);
      return stats.size;
    } catch (e) {
      log.error(e, `AuditLogService -> getLogFileSize`);
      return 0;
    }
  }

  /**
   * Export audit logs
   * @param {string} exportPath - Path to export the logs to
   * @returns {boolean} - Success status
   */
  exportLogs(exportPath) {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return false;
      }

      fs.copyFileSync(this.logFilePath, exportPath);
      return true;
    } catch (e) {
      log.error(e, `AuditLogService -> exportLogs`);
      return false;
    }
  }
}

const auditLogService = new AuditLogService();
export default auditLogService;