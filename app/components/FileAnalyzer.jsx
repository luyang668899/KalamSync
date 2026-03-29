import React, { useEffect, useState } from 'react';
import useFileAnalysis from '../services/useFileAnalysis';
import useStorage from '../services/useStorage';
import useI18n from '../services/i18n/useI18n';

const FileAnalyzer = ({ deviceId }) => {
  const { largeFiles, duplicateFiles, loading, error, minLargeFileSize, findLargeFiles, findDuplicateFiles, setMinSize } = useFileAnalysis();
  const { formatSize } = useStorage();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('large');
  const [sizeThreshold, setSizeThreshold] = useState(100); // 默认100MB

  useEffect(() => {
    if (deviceId) {
      analyzeFiles();
    }
  }, [deviceId]);

  const analyzeFiles = async () => {
    await findLargeFiles(deviceId, sizeThreshold * 1024 * 1024);
    await findDuplicateFiles(deviceId);
  };

  const handleSizeThresholdChange = (e) => {
    const size = parseInt(e.target.value);
    setSizeThreshold(size);
    setMinSize(size * 1024 * 1024);
  };

  const handleRefresh = async () => {
    await analyzeFiles();
  };

  const formatPath = (path) => {
    return path.length > 50 ? path.substring(0, 47) + '...' : path;
  };

  return (
    <div className="file-analyzer">
      <h3>文件分析</h3>
      
      <div className="analyzer-tabs">
        <button 
          className={`tab-btn ${activeTab === 'large' ? 'active' : ''}`}
          onClick={() => setActiveTab('large')}
        >
          大文件
        </button>
        <button 
          className={`tab-btn ${activeTab === 'duplicate' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicate')}
        >
          重复文件
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="analyzer-actions">
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? '分析中...' : '刷新分析'}
        </button>
      </div>

      {activeTab === 'large' && (
        <div className="large-files-section">
          <div className="size-threshold">
            <label htmlFor="size-threshold">最小文件大小:</label>
            <input
              type="range"
              id="size-threshold"
              min="10"
              max="500"
              value={sizeThreshold}
              onChange={handleSizeThresholdChange}
            />
            <span className="size-value">{sizeThreshold}MB</span>
          </div>

          {loading ? (
            <p>正在分析大文件...</p>
          ) : largeFiles.length === 0 ? (
            <p>没有找到大于 {sizeThreshold}MB 的文件</p>
          ) : (
            <div className="large-files-list">
              <table>
                <thead>
                  <tr>
                    <th>文件名</th>
                    <th>大小</th>
                    <th>路径</th>
                  </tr>
                </thead>
                <tbody>
                  {largeFiles.map((file, index) => (
                    <tr key={index}>
                      <td>{file.name}</td>
                      <td>{formatSize(file.size)}</td>
                      <td title={file.path}>{formatPath(file.path)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'duplicate' && (
        <div className="duplicate-files-section">
          {loading ? (
            <p>正在分析重复文件...</p>
          ) : duplicateFiles.length === 0 ? (
            <p>没有找到重复文件</p>
          ) : (
            <div className="duplicate-files-list">
              {duplicateFiles.map((group, groupIndex) => (
                <div key={groupIndex} className="duplicate-group">
                  <div className="group-header">
                    <span className="group-title">重复文件组 {groupIndex + 1}</span>
                    <span className="group-count">{group.files.length} 个文件</span>
                  </div>
                  <table className="group-files">
                    <thead>
                      <tr>
                        <th>文件名</th>
                        <th>大小</th>
                        <th>路径</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.files.map((file, fileIndex) => (
                        <tr key={fileIndex}>
                          <td>{file.name}</td>
                          <td>{formatSize(file.size)}</td>
                          <td title={file.path}>{formatPath(file.path)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileAnalyzer;