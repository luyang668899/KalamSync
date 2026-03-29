// 主进程剪贴板服务
const { clipboard } = require('electron');

class ClipboardServiceMain {
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
    // 这里可以通过MTP协议将剪贴板内容发送到Android设备
    console.log('Clipboard changed in main process:', content);
  }

  setClipboardContent(content) {
    clipboard.writeText(content);
    this.lastClipboardContent = content;
  }

  getClipboardContent() {
    return clipboard.readText();
  }

  // 从Android设备接收剪贴板内容
  receiveClipboardFromDevice(content) {
    if (content !== this.lastClipboardContent) {
      this.setClipboardContent(content);
      console.log('Received clipboard from device:', content);
    }
  }
}

const clipboardServiceMain = new ClipboardServiceMain();
module.exports = clipboardServiceMain;