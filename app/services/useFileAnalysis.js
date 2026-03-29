// 文件分析 Hook
import { useCallback, useState } from 'react';
import fileAnalysisService from './FileAnalysisService';

const useFileAnalysis = () => {
  const [largeFiles, setLargeFiles] = useState([]);
  const [duplicateFiles, setDuplicateFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minLargeFileSize, setMinLargeFileSize] = useState(fileAnalysisService.getMinLargeFileSize());

  const findLargeFiles = useCallback(async (deviceId, size) => {
    try {
      setLoading(true);
      setError(null);
      const files = await fileAnalysisService.findLargeFiles(deviceId, size);
      setLargeFiles(files);
      return files;
    } catch (err) {
      setError('Failed to find large files');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const findDuplicateFiles = useCallback(async (deviceId) => {
    try {
      setLoading(true);
      setError(null);
      const files = await fileAnalysisService.findDuplicateFiles(deviceId);
      setDuplicateFiles(files);
      return files;
    } catch (err) {
      setError('Failed to find duplicate files');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const setMinSize = useCallback((size) => {
    fileAnalysisService.setMinLargeFileSize(size);
    setMinLargeFileSize(size);
  }, []);

  return {
    largeFiles,
    duplicateFiles,
    loading,
    error,
    minLargeFileSize,
    findLargeFiles,
    findDuplicateFiles,
    setMinSize
  };
};

export default useFileAnalysis;