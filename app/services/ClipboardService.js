// 剪贴板服务
import { clipboard } from 'electron';

class ClipboardService {
  constructor() {
    this.enabled = false;
    this.lastClipboardContent = '';
    this.clipboardWatchInterval = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.startWatchingClipboard();
    } else {
      this.stopWatchingClipboard();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  startWatchingClipboard() {
    this.clipboardWatchInterval = setInterval(() => {
      this.checkClipboardChanges();
    }, 1000);
  }

  stopWatchingClipboard() {
    if (this.clipboardWatchInterval) {
      clearInterval(this.clipboardWatchInterval);
      this.clipboardWatchInterval = null;
    }
  }

  checkClipboardChanges() {
    const currentContent = clipboard.readText();
    if (currentContent !== this.lastClipboardContent) {
      this.lastClipboardContent = currentContent;
      this.onClipboardChanged(currentContent);
    }
  }

  onClipboardChanged(content) {
    // 这里可以通过IPC发送到主进程，然后传输到Android设备
    console.log('Clipboard changed:', content);
  }

  setClipboardContent(content) {
    clipboard.writeText(content);
    this.lastClipboardContent = content;
  }

  getClipboardContent() {
    return clipboard.readText();
  }
}

const clipboardService = new ClipboardService();
export default clipboardService;