import React, { useEffect } from 'react';
import useStorage from '../services/useStorage';
import useI18n from '../services/i18n/useI18n';

const StorageAnalyzer = ({ deviceId }) => {
  const { storageInfo, loading, error, getStorageInfo, formatSize } = useStorage();
  const { t } = useI18n();

  useEffect(() => {
    if (deviceId) {
      getStorageInfo(deviceId);
    }
  }, [deviceId, getStorageInfo]);

  if (loading) {
    return <div className="storage-analyzer">加载存储信息中...</div>;
  }

  if (error) {
    return <div className="storage-analyzer error">{error}</div>;
  }

  if (!storageInfo) {
    return <div className="storage-analyzer">请选择设备查看存储信息</div>;
  }

  const getPercentage = (value, total) => {
    return Math.round((value / total) * 100);
  };

  const getCategoryColor = (index) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
    return colors[index % colors.length];
  };

  const usedPercentage = getPercentage(storageInfo.used, storageInfo.total);
  const freePercentage = 100 - usedPercentage;

  return (
    <div className="storage-analyzer">
      <h3>存储空间分析</h3>
      
      {/* 总存储使用情况 */}
      <div className="storage-overview">
        <div className="storage-summary">
          <div className="storage-item">
            <span className="label">总存储:</span>
            <span className="value">{formatSize(storageInfo.total)}</span>
          </div>
          <div className="storage-item">
            <span className="label">已使用:</span>
            <span className="value used">{formatSize(storageInfo.used)} ({usedPercentage}%)</span>
          </div>
          <div className="storage-item">
            <span className="label">可用:</span>
            <span className="value free">{formatSize(storageInfo.free)} ({freePercentage}%)</span>
          </div>
        </div>
        
        <div className="storage-bar">
          <div 
            className="storage-bar-used" 
            style={{ width: `${usedPercentage}%` }}
          ></div>
          <div 
            className="storage-bar-free" 
            style={{ width: `${freePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 存储分区 */}
      <div className="storage-partitions">
        <h4>存储分区</h4>
        <div className="partitions-list">
          {storageInfo.partitions.map((partition, index) => {
            const partitionUsedPercentage = getPercentage(partition.used, partition.total);
            return (
              <div key={index} className="partition-item">
                <div className="partition-header">
                  <span className="partition-name">{partition.name}</span>
                  <span className="partition-size">
                    {formatSize(partition.used)} / {formatSize(partition.total)}
                  </span>
                </div>
                <div className="partition-bar">
                  <div 
                    className="partition-bar-used" 
                    style={{ width: `${partitionUsedPercentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 文件类型分布 */}
      <div className="storage-categories">
        <h4>文件类型分布</h4>
        <div className="categories-list">
          {storageInfo.categories.map((category, index) => {
            const categoryPercentage = getPercentage(category.size, storageInfo.used);
            const color = getCategoryColor(index);
            return (
              <div key={index} className="category-item">
                <div className="category-header">
                  <span className="category-name" style={{ color }}>
                    {category.name}
                  </span>
                  <span className="category-size">
                    {formatSize(category.size)} ({categoryPercentage}%)
                  </span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill" 
                    style={{ 
                      width: `${categoryPercentage}%`,
                      backgroundColor: color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StorageAnalyzer;