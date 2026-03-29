// 通知服务
class NotificationService {
  constructor() {
    this.enabled = false;
    this.notifications = [];
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  addNotification(notification) {
    if (!this.enabled) return;
    
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString()
    };
    
    this.notifications.unshift(newNotification);
    // 限制通知数量
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    return newNotification;
  }

  getNotifications() {
    return this.notifications;
  }

  clearNotifications() {
    this.notifications = [];
  }

  removeNotification(id) {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
}

const notificationService = new NotificationService();
export default notificationService;