// 辅助功能服务
class AccessibilityService {
  constructor() {
    this.highContrastMode = false;
    this.screenReaderEnabled = true;
  }

  setHighContrastMode(enabled) {
    this.highContrastMode = enabled;
  }

  getHighContrastMode() {
    return this.highContrastMode;
  }

  setScreenReaderEnabled(enabled) {
    this.screenReaderEnabled = enabled;
  }

  getScreenReaderEnabled() {
    return this.screenReaderEnabled;
  }

  getAccessibilitySettings() {
    return {
      highContrastMode: this.highContrastMode,
      screenReaderEnabled: this.screenReaderEnabled
    };
  }

  setAccessibilitySettings(settings) {
    if (settings.highContrastMode !== undefined) {
      this.highContrastMode = settings.highContrastMode;
    }
    if (settings.screenReaderEnabled !== undefined) {
      this.screenReaderEnabled = settings.screenReaderEnabled;
    }
  }
}

const accessibilityService = new AccessibilityService();
export default accessibilityService;