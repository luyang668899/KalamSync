// 存储 Hook
import { useCallback, useState, useEffect } from 'react';
import storageService from './StorageService';

const useStorage = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStorageInfo = useCallback(async (deviceId) => {
    try {
      setLoading(true);
      setError(null);
      const info = await storageService.getStorageInfo(deviceId);
      setStorageInfo(info);
      return info;
    } catch (err) {
      setError('Failed to get storage info');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const formatSize = useCallback((bytes) => {
    return storageService.formatSize(bytes);
  }, []);

  return {
    storageInfo,
    loading,
    error,
    getStorageInfo,
    formatSize
  };
};

export default useStorage;