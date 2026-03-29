import React from 'react';
import useNotification from '../services/useNotification';
import useI18n from '../services/i18n/useI18n';

const NotificationList = () => {
  const { notifications, clearNotifications, removeNotification } = useNotification();
  const { t } = useI18n();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h3>通知</h3>
        {notifications.length > 0 && (
          <button className="clear-all" onClick={clearNotifications}>
            清除全部
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <p className="no-notifications">没有通知</p>
      ) : (
        <div className="notification-items">
          {notifications.map(notification => (
            <div key={notification.id} className="notification-item">
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.body}</p>
                <div className="notification-meta">
                  {notification.appName && (
                    <span className="app-name">{notification.appName}</span>
                  )}
                  <span className="time">{formatTime(notification.timestamp)}</span>
                </div>
              </div>
              <button 
                className="remove-notification"
                onClick={() => removeNotification(notification.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;