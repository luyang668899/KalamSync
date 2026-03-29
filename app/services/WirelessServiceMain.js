import { ipcMain } from 'electron';
import { log } from '../utils/log';

class WirelessServiceMain {
  constructor() {
    this.wirelessDevices = new Map();
    this.setupIPCHandlers();
  }

  setupIPCHandlers() {
    ipcMain.on('wireless:start-scan', (event) => {
      this.startScan(event);
    });

    ipcMain.on('wireless:connect', (event, deviceId) => {
      this.connectToDevice(event, deviceId);
    });

    ipcMain.on('wireless:disconnect', (event, deviceId) => {
      this.disconnectFromDevice(event, deviceId);
    });
  }

  async startScan(event) {
    try {
      // 模拟扫描无线设备
      // 实际实现中，这里应该使用网络扫描来发现 Android 设备
      const devices = [
        {
          id: 'device-1',
          name: 'Android Device 1',
          ip: '192.168.1.100',
          status: 'disconnected',
          type: 'wireless'
        },
        {
          id: 'device-2',
          name: 'Android Device 2',
          ip: '192.168.1.101',
          status: 'disconnected',
          type: 'wireless'
        }
      ];

      // 存储设备信息
      devices.forEach(device => {
        this.wirelessDevices.set(device.id, device);
      });

      // 发送扫描完成事件
      event.sender.send('wireless:scan-complete', devices);
    } catch (error) {
      log.error(`Error scanning for wireless devices: ${error}`, 'WirelessServiceMain -> startScan');
      event.sender.send('wireless:scan-complete', []);
    }
  }

  async connectToDevice(event, deviceId) {
    try {
      const device = this.wirelessDevices.get(deviceId);
      if (!device) {
        event.sender.send('wireless:connect-error', 'Device not found');
        return;
      }

      // 模拟连接过程
      // 实际实现中，这里应该建立与设备的网络连接
      setTimeout(() => {
        device.status = 'connected';
        this.wirelessDevices.set(deviceId, device);
        event.sender.send('wireless:connect-success', device);
        event.sender.send('wireless:connection-status', deviceId, 'connected');
      }, 1000);
    } catch (error) {
      log.error(`Error connecting to device ${deviceId}: ${error}`, 'WirelessServiceMain -> connectToDevice');
      event.sender.send('wireless:connect-error', error.message);
    }
  }

  async disconnectFromDevice(event, deviceId) {
    try {
      const device = this.wirelessDevices.get(deviceId);
      if (device) {
        device.status = 'disconnected';
        this.wirelessDevices.set(deviceId, device);
      }

      // 发送断开连接完成事件
      event.sender.send('wireless:disconnect-complete');
      event.sender.send('wireless:connection-status', deviceId, 'disconnected');
    } catch (error) {
      log.error(`Error disconnecting from device ${deviceId}: ${error}`, 'WirelessServiceMain -> disconnectFromDevice');
      event.sender.send('wireless:disconnect-complete');
    }
  }

  getWirelessDevices() {
    return Array.from(this.wirelessDevices.values());
  }

  getDevice(deviceId) {
    return this.wirelessDevices.get(deviceId);
  }
}

new WirelessServiceMain();