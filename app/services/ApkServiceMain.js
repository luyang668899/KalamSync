// 主进程APK服务
const { execSync } = require('child_process');

class ApkServiceMain {
  constructor() {
    this.installing = false;
    this.uninstalling = false;
  }

  async installApk(filePath, deviceId) {
    if (this.installing) {
      throw new Error('Another installation is in progress');
    }

    try {
      this.installing = true;
      // 使用ADB命令安装APK
      const adbCommand = deviceId 
        ? `adb -s ${deviceId} install -r "${filePath}"` 
        : `adb install -r "${filePath}"`;
      
      console.log('Running ADB command:', adbCommand);
      execSync(adbCommand, { stdio: 'inherit' });
      console.log('APK installed successfully');
      return true;
    } catch (error) {
      console.error('Failed to install APK:', error);
      throw error;
    } finally {
      this.installing = false;
    }
  }

  async uninstallApk(packageName, deviceId) {
    if (this.uninstalling) {
      throw new Error('Another uninstallation is in progress');
    }

    try {
      this.uninstalling = true;
      // 使用ADB命令卸载APK
      const adbCommand = deviceId 
        ? `adb -s ${deviceId} uninstall ${packageName}` 
        : `adb uninstall ${packageName}`;
      
      console.log('Running ADB command:', adbCommand);
      execSync(adbCommand, { stdio: 'inherit' });
      console.log('APK uninstalled successfully');
      return true;
    } catch (error) {
      console.error('Failed to uninstall APK:', error);
      throw error;
    } finally {
      this.uninstalling = false;
    }
  }

  async getInstalledApps(deviceId) {
    try {
      // 使用ADB命令获取已安装应用列表
      const adbCommand = deviceId 
        ? `adb -s ${deviceId} shell pm list packages -f` 
        : `adb shell pm list packages -f`;
      
      console.log('Running ADB command:', adbCommand);
      const output = execSync(adbCommand, { encoding: 'utf8' });
      
      // 解析输出
      const apps = [];
      const lines = output.trim().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('package:')) {
          const match = line.match(/package:(.*)=([^=]+)/);
          if (match) {
            const [, apkPath, packageName] = match;
            apps.push({ packageName, apkPath });
          }
        }
      }
      
      return apps;
    } catch (error) {
      console.error('Failed to get installed apps:', error);
      return [];
    }
  }

  isInstalling() {
    return this.installing;
  }

  isUninstalling() {
    return this.uninstalling;
  }
}

const apkServiceMain = new ApkServiceMain();
module.exports = apkServiceMain;