// 辅助功能 Hook
import { useCallback } from 'react';
import accessibilityService from './AccessibilityService';

const useAccessibility = () => {
  const setHighContrastMode = useCallback((enabled) => {
    accessibilityService.setHighContrastMode(enabled);
  }, []);

  const getHighContrastMode = useCallback(() => {
    return accessibilityService.getHighContrastMode();
  }, []);

  const setScreenReaderEnabled = useCallback((enabled) => {
    accessibilityService.setScreenReaderEnabled(enabled);
  }, []);

  const getScreenReaderEnabled = useCallback(() => {
    return accessibilityService.getScreenReaderEnabled();
  }, []);

  const getAccessibilitySettings = useCallback(() => {
    return accessibilityService.getAccessibilitySettings();
  }, []);

  const setAccessibilitySettings = useCallback((settings) => {
    accessibilityService.setAccessibilitySettings(settings);
  }, []);

  return {
    setHighContrastMode,
    getHighContrastMode,
    setScreenReaderEnabled,
    getScreenReaderEnabled,
    getAccessibilitySettings,
    setAccessibilitySettings
  };
};

export default useAccessibility;