import React from 'react';
import useClipboard from '../services/useClipboard';
import useI18n from '../services/i18n/useI18n';

const ClipboardSettings = () => {
  const { isEnabled, setEnabled } = useClipboard();
  const { t } = useI18n();
  
  const handleClipboardToggle = (e) => {
    setEnabled(e.target.checked);
  };

  return (
    <div className="clipboard-settings">
      <h3>剪贴板同步</h3>
      <div className="setting-item">
        <label htmlFor="clipboard-sync">跨设备剪贴板共享:</label>
        <input
          type="checkbox"
          id="clipboard-sync"
          checked={isEnabled()}
          onChange={handleClipboardToggle}
        />
      </div>
      <p className="setting-description">
        启用后，您在Mac和Android设备之间复制的内容将自动同步。
      </p>
    </div>
  );
};

export default ClipboardSettings;