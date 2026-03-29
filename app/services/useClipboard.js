// 剪贴板 Hook
import { useCallback } from 'react';
import clipboardService from './ClipboardService';

const useClipboard = () => {
  const setEnabled = useCallback((enabled) => {
    clipboardService.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return clipboardService.isEnabled();
  }, []);

  const getClipboardContent = useCallback(() => {
    return clipboardService.getClipboardContent();
  }, []);

  const setClipboardContent = useCallback((content) => {
    clipboardService.setClipboardContent(content);
  }, []);

  return {
    setEnabled,
    isEnabled,
    getClipboardContent,
    setClipboardContent
  };
};

export default useClipboard;