// 存储分析服务
class StorageService {
  constructor() {
    this.storageData = {};
  }

  async getStorageInfo(deviceId) {
    try {
      // 这里应该通过IPC调用主进程获取存储信息
      console.log('Getting storage info for device:', deviceId);
      // 模拟存储信息
      this.storageData[deviceId] = {
        total: 64 * 1024 * 1024 * 1024, // 64GB
        used: 45 * 1024 * 1024 * 1024,  // 45GB
        free: 19 * 1024 * 1024 * 1024,  // 19GB
        partitions: [
          {
            name: 'Internal Storage',
            total: 58 * 1024 * 1024 * 1024,
            used: 40 * 1024 * 1024 * 1024,
            free: 18 * 1024 * 1024 * 1024
          },
          {
            name: 'SD Card',
            total: 6 * 1024 * 1024 * 1024,
            used: 5 * 1024 * 1024 * 1024,
            free: 1 * 1024 * 1024 * 1024
          }
        ],
        categories: [
          { name: 'Apps', size: 10 * 1024 * 1024 * 1024 },
          { name: 'Photos', size: 15 * 1024 * 1024 * 1024 },
          { name: 'Videos', size: 12 * 1024 * 1024 * 1024 },
          { name: 'Music', size: 5 * 1024 * 1024 * 1024 },
          { name: 'Documents', size: 3 * 1024 * 1024 * 1024 }
        ]
      };
      return this.storageData[deviceId];
    } catch (error) {
      console.error('Failed to get storage info:', error);
      throw error;
    }
  }

  getStorageData(deviceId) {
    return this.storageData[deviceId] || null;
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

const storageService = new StorageService();
export default storageService;