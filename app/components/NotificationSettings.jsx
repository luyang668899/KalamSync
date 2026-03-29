import React from 'react';
import useNotification from '../services/useNotification';
import useI18n from '../services/i18n/useI18n';

const NotificationSettings = () => {
  const { isEnabled, setEnabled } = useNotification();
  const { t } = useI18n();
  
  const handleNotificationToggle = (e) => {
    setEnabled(e.target.checked);
  };

  return (
    <div className="notification-settings">
      <h3>通知镜像</h3>
      <div className="setting-item">
        <label htmlFor="notification-mirror">在 Mac 上显示 Android 通知:</label>
        <input
          type="checkbox"
          id="notification-mirror"
          checked={isEnabled()}
          onChange={handleNotificationToggle}
        />
      </div>
      <p className="setting-description">
        启用后，您的 Android 设备上的通知将在 Mac 上显示。
      </p>
    </div>
  );
};

export default NotificationSettings;