// 主进程通知服务
const { Notification } = require('electron');

class NotificationServiceMain {
  constructor() {
    this.enabled = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // 显示通知
  showNotification(title, body, icon = null) {
    if (!this.enabled) return;
    
    const notification = new Notification({
      title,
      body,
      icon,
      silent: false
    });
    
    notification.show();
    return notification;
  }

  // 从Android设备接收通知
  receiveNotificationFromDevice(notificationData) {
    if (!this.enabled) return;
    
    const { title, body, appName, icon } = notificationData;
    const notificationTitle = appName ? `${appName}: ${title}` : title;
    
    this.showNotification(notificationTitle, body, icon);
    console.log('Received notification from device:', notificationData);
  }
}

const notificationServiceMain = new NotificationServiceMain();
module.exports = notificationServiceMain;