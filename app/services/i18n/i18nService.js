// i18n服务
import translations from './translations';

class I18nService {
  constructor() {
    this.currentLanguage = 'en';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLanguage = lang;
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  t(key, defaultValue = '') {
    const keys = key.split('.');
    let result = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return defaultValue;
      }
    }
    
    return result;
  }

  getAvailableLanguages() {
    return Object.keys(translations);
  }
}

const i18nService = new I18nService();
export default i18nService;