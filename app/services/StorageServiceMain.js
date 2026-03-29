// 主进程存储服务
const { execSync } = require('child_process');

class StorageServiceMain {
  constructor() {
    this.storageData = {};
  }

  async getStorageInfo(deviceId) {
    try {
      // 使用ADB命令获取存储信息
      const adbCommand = deviceId 
        ? `adb -s ${deviceId} shell df -h` 
        : `adb shell df -h`;
      
      console.log('Running ADB command:', adbCommand);
      const output = execSync(adbCommand, { encoding: 'utf8' });
      
      // 解析输出
      const partitions = [];
      const lines = output.trim().split('\n');
      
      // 跳过标题行
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split(/\s+/);
          if (parts.length >= 6) {
            const [filesystem, size, used, available, usePercent, mountedOn] = parts;
            
            // 只关注实际存储分区
            if (mountedOn === '/storage/emulated/0' || mountedOn.includes('/mnt/expand')) {
              partitions.push({
                name: mountedOn === '/storage/emulated/0' ? 'Internal Storage' : 'SD Card',
                total: this.parseSize(size),
                used: this.parseSize(used),
                free: this.parseSize(available)
              });
            }
          }
        }
      }
      
      // 计算总存储
      const total = partitions.reduce((sum, p) => sum + p.total, 0);
      const used = partitions.reduce((sum, p) => sum + p.used, 0);
      const free = partitions.reduce((sum, p) => sum + p.free, 0);
      
      // 模拟分类数据
      const categories = [
        { name: 'Apps', size: used * 0.22 },
        { name: 'Photos', size: used * 0.33 },
        { name: 'Videos', size: used * 0.27 },
        { name: 'Music', size: used * 0.11 },
        { name: 'Documents', size: used * 0.07 }
      ];
      
      const storageInfo = {
        total,
        used,
        free,
        partitions,
        categories
      };
      
      this.storageData[deviceId] = storageInfo;
      return storageInfo;
    } catch (error) {
      console.error('Failed to get storage info:', error);
      // 返回模拟数据作为 fallback
      return this.getMockStorageInfo(deviceId);
    }
  }

  getMockStorageInfo(deviceId) {
    return {
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
  }

  parseSize(sizeStr) {
    const units = {
      'B': 1,
      'K': 1024,
      'M': 1024 * 1024,
      'G': 1024 * 1024 * 1024,
      'T': 1024 * 1024 * 1024 * 1024
    };
    
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([BKMGT]?)$/i);
    if (match) {
      const [, value, unit] = match;
      return parseFloat(value) * (units[unit.toUpperCase()] || 1);
    }
    return 0;
  }

  getStorageData(deviceId) {
    return this.storageData[deviceId] || null;
  }
}

const storageServiceMain = new StorageServiceMain();
module.exports = storageServiceMain;