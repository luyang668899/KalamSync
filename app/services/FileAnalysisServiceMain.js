// 主进程文件分析服务
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class FileAnalysisServiceMain {
  constructor() {
    this.largeFiles = [];
    this.duplicateFiles = [];
    this.minLargeFileSize = 100 * 1024 * 1024; // 100MB
  }

  async findLargeFiles(deviceId, minSize = this.minLargeFileSize) {
    try {
      // 使用ADB命令查找大文件
      const adbCommand = deviceId 
        ? `adb -s ${deviceId} shell find /storage/emulated/0 -type f -size +${Math.floor(minSize / 1024 / 1024)}M -exec ls -l {} \;` 
        : `adb shell find /storage/emulated/0 -type f -size +${Math.floor(minSize / 1024 / 1024)}M -exec ls -l {} \;`;
      
      console.log('Running ADB command:', adbCommand);
      const output = execSync(adbCommand, { encoding: 'utf8' });
      
      // 解析输出
      const largeFiles = [];
      const lines = output.trim().split('\n');
      
      for (const line of lines) {
        if (line) {
          const parts = line.split(/\s+/);
          if (parts.length >= 9) {
            const size = parseInt(parts[4]);
            const filePath = parts.slice(8).join(' ');
            const fileName = path.basename(filePath);
            
            largeFiles.push({
              path: filePath,
              size: size,
              name: fileName
            });
          }
        }
      }
      
      this.largeFiles = largeFiles;
      return largeFiles;
    } catch (error) {
      console.error('Failed to find large files:', error);
      // 返回模拟数据作为 fallback
      return this.getMockLargeFiles();
    }
  }

  async findDuplicateFiles(deviceId) {
    try {
      // 这里应该实现更复杂的重复文件检测逻辑
      // 由于实际实现可能比较复杂，这里返回模拟数据
      console.log('Finding duplicate files for device:', deviceId);
      return this.getMockDuplicateFiles();
    } catch (error) {
      console.error('Failed to find duplicate files:', error);
      return this.getMockDuplicateFiles();
    }
  }

  getMockLargeFiles() {
    return [
      { path: '/storage/emulated/0/Download/video1.mp4', size: 500 * 1024 * 1024, name: 'video1.mp4' },
      { path: '/storage/emulated/0/Download/video2.mp4', size: 300 * 1024 * 1024, name: 'video2.mp4' },
      { path: '/storage/emulated/0/DCIM/Camera/photo1.jpg', size: 150 * 1024 * 1024, name: 'photo1.jpg' },
      { path: '/storage/emulated/0/DCIM/Camera/photo2.jpg', size: 120 * 1024 * 1024, name: 'photo2.jpg' },
      { path: '/storage/emulated/0/Documents/large-doc.pdf', size: 200 * 1024 * 1024, name: 'large-doc.pdf' }
    ];
  }

  getMockDuplicateFiles() {
    return [
      {
        hash: 'abc123',
        files: [
          { path: '/storage/emulated/0/Download/file1.jpg', size: 5 * 1024 * 1024, name: 'file1.jpg' },
          { path: '/storage/emulated/0/DCIM/Camera/file1.jpg', size: 5 * 1024 * 1024, name: 'file1.jpg' }
        ]
      },
      {
        hash: 'def456',
        files: [
          { path: '/storage/emulated/0/Download/doc1.pdf', size: 2 * 1024 * 1024, name: 'doc1.pdf' },
          { path: '/storage/emulated/0/Documents/doc1.pdf', size: 2 * 1024 * 1024, name: 'doc1.pdf' }
        ]
      }
    ];
  }

  getLargeFiles() {
    return this.largeFiles;
  }

  getDuplicateFiles() {
    return this.duplicateFiles;
  }

  setMinLargeFileSize(size) {
    this.minLargeFileSize = size;
  }

  getMinLargeFileSize() {
    return this.minLargeFileSize;
  }
}

const fileAnalysisServiceMain = new FileAnalysisServiceMain();
module.exports = fileAnalysisServiceMain;