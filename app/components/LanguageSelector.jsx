import React from 'react';
import useI18n from '../services/i18n/useI18n';

const LanguageSelector = () => {
  const { getLanguage, setLanguage, getAvailableLanguages, t } = useI18n();
  const currentLanguage = getLanguage();
  const availableLanguages = getAvailableLanguages();

  const languageNames = {
    en: 'English',
    zh: '中文',
    ja: '日本語',
    de: 'Deutsch'
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language">{t('settings.language')}:</label>
      <select
        id="language"
        value={currentLanguage}
        onChange={handleLanguageChange}
      >
        {availableLanguages.map(lang => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;