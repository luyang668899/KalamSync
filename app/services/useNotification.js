// 通知 Hook
import { useCallback, useState, useEffect } from 'react';
import notificationService from './NotificationService';

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const setEnabled = useCallback((enabled) => {
    notificationService.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return notificationService.isEnabled();
  }, []);

  const getNotifications = useCallback(() => {
    return notificationService.getNotifications();
  }, []);

  const clearNotifications = useCallback(() => {
    notificationService.clearNotifications();
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id) => {
    notificationService.removeNotification(id);
    setNotifications(notificationService.getNotifications());
  }, []);

  useEffect(() => {
    // 初始加载通知
    setNotifications(notificationService.getNotifications());
  }, []);

  return {
    setEnabled,
    isEnabled,
    notifications,
    getNotifications,
    clearNotifications,
    removeNotification
  };
};

export default useNotification;