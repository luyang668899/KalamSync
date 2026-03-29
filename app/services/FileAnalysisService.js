// 文件分析服务
class FileAnalysisService {
  constructor() {
    this.largeFiles = [];
    this.duplicateFiles = [];
    this.minLargeFileSize = 100 * 1024 * 1024; // 100MB
  }

  async findLargeFiles(deviceId, minSize = this.minLargeFileSize) {
    try {
      // 这里应该通过IPC调用主进程获取文件列表
      console.log('Finding large files for device:', deviceId, 'with min size:', minSize);
      // 模拟大文件列表
      this.largeFiles = [
        { path: '/storage/emulated/0/Download/video1.mp4', size: 500 * 1024 * 1024, name: 'video1.mp4' },
        { path: '/storage/emulated/0/Download/video2.mp4', size: 300 * 1024 * 1024, name: 'video2.mp4' },
        { path: '/storage/emulated/0/DCIM/Camera/photo1.jpg', size: 150 * 1024 * 1024, name: 'photo1.jpg' },
        { path: '/storage/emulated/0/DCIM/Camera/photo2.jpg', size: 120 * 1024 * 1024, name: 'photo2.jpg' },
        { path: '/storage/emulated/0/Documents/large-doc.pdf', size: 200 * 1024 * 1024, name: 'large-doc.pdf' }
      ];
      return this.largeFiles;
    } catch (error) {
      console.error('Failed to find large files:', error);
      throw error;
    }
  }

  async findDuplicateFiles(deviceId) {
    try {
      // 这里应该通过IPC调用主进程获取文件列表并检测重复
      console.log('Finding duplicate files for device:', deviceId);
      // 模拟重复文件列表
      this.duplicateFiles = [
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
      return this.duplicateFiles;
    } catch (error) {
      console.error('Failed to find duplicate files:', error);
      throw error;
    }
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

const fileAnalysisService = new FileAnalysisService();
export default fileAnalysisService;