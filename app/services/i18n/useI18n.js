// i18n Hook
import { useCallback } from 'react';
import i18nService from './i18nService';

const useI18n = () => {
  const t = useCallback((key, defaultValue = '') => {
    return i18nService.t(key, defaultValue);
  }, []);

  const setLanguage = useCallback((lang) => {
    i18nService.setLanguage(lang);
  }, []);

  const getLanguage = useCallback(() => {
    return i18nService.getLanguage();
  }, []);

  const getAvailableLanguages = useCallback(() => {
    return i18nService.getAvailableLanguages();
  }, []);

  return {
    t,
    setLanguage,
    getLanguage,
    getAvailableLanguages
  };
};

export default useI18n;