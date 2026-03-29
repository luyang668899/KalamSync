import React from 'react';
import useAccessibility from '../services/useAccessibility';
import useI18n from '../services/i18n/useI18n';

const AccessibilitySettings = () => {
  const { getHighContrastMode, setHighContrastMode, getScreenReaderEnabled, setScreenReaderEnabled } = useAccessibility();
  const { t } = useI18n();
  
  const highContrastMode = getHighContrastMode();
  const screenReaderEnabled = getScreenReaderEnabled();

  const handleHighContrastChange = (e) => {
    setHighContrastMode(e.target.checked);
  };

  const handleScreenReaderChange = (e) => {
    setScreenReaderEnabled(e.target.checked);
  };

  return (
    <div className="accessibility-settings">
      <h3>辅助功能</h3>
      <div className="setting-item">
        <label htmlFor="high-contrast">高对比度模式:</label>
        <input
          type="checkbox"
          id="high-contrast"
          checked={highContrastMode}
          onChange={handleHighContrastChange}
        />
      </div>
      <div className="setting-item">
        <label htmlFor="screen-reader">屏幕阅读器支持:</label>
        <input
          type="checkbox"
          id="screen-reader"
          checked={screenReaderEnabled}
          onChange={handleScreenReaderChange}
        />
      </div>
    </div>
  );
};

export default AccessibilitySettings;