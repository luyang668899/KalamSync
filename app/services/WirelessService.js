import { ipcRenderer } from 'electron';

class WirelessService {
  constructor() {
    this.wirelessDevices = new Map();
    this.setupIPCListeners();
  }

  setupIPCListeners() {
    ipcRenderer.on('wireless:device-found', (event, device) => {
      this.wirelessDevices.set(device.id, device);
    });

    ipcRenderer.on('wireless:device-lost', (event, deviceId) => {
      this.wirelessDevices.delete(deviceId);
    });

    ipcRenderer.on('wireless:connection-status', (event, deviceId, status) => {
      if (this.wirelessDevices.has(deviceId)) {
        const device = this.wirelessDevices.get(deviceId);
        device.status = status;
        this.wirelessDevices.set(deviceId, device);
      }
    });
  }

  async startScan() {
    return new Promise((resolve) => {
      ipcRenderer.send('wireless:start-scan');
      ipcRenderer.once('wireless:scan-complete', (event, devices) => {
        devices.forEach(device => {
          this.wirelessDevices.set(device.id, device);
        });
        resolve(devices);
      });
    });
  }

  async connectToDevice(deviceId) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('wireless:connect', deviceId);
      ipcRenderer.once('wireless:connect-success', (event, device) => {
        this.wirelessDevices.set(device.id, { ...device, status: 'connected' });
        resolve(device);
      });
      ipcRenderer.once('wireless:connect-error', (event, error) => {
        reject(error);
      });
    });
  }

  async disconnectFromDevice(deviceId) {
    return new Promise((resolve) => {
      ipcRenderer.send('wireless:disconnect', deviceId);
      ipcRenderer.once('wireless:disconnect-complete', () => {
        if (this.wirelessDevices.has(deviceId)) {
          const device = this.wirelessDevices.get(deviceId);
          device.status = 'disconnected';
          this.wirelessDevices.set(deviceId, device);
        }
        resolve();
      });
    });
  }

  getWirelessDevices() {
    return Array.from(this.wirelessDevices.values());
  }

  getDevice(deviceId) {
    return this.wirelessDevices.get(deviceId);
  }

  isDeviceConnected(deviceId) {
    const device = this.wirelessDevices.get(deviceId);
    return device && device.status === 'connected';
  }
}

export default new WirelessService();