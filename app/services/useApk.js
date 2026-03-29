// APK Hook
import { useCallback, useState } from 'react';
import apkService from './ApkService';

const useApk = () => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [installedApps, setInstalledApps] = useState([]);

  const installApk = useCallback(async (filePath, deviceId) => {
    try {
      setIsInstalling(true);
      const result = await apkService.installApk(filePath, deviceId);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsInstalling(false);
    }
  }, []);

  const uninstallApk = useCallback(async (packageName, deviceId) => {
    try {
      setIsUninstalling(true);
      const result = await apkService.uninstallApk(packageName, deviceId);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsUninstalling(false);
    }
  }, []);

  const getInstalledApps = useCallback(async (deviceId) => {
    try {
      const apps = await apkService.getInstalledApps(deviceId);
      setInstalledApps(apps);
      return apps;
    } catch (error) {
      console.error('Failed to get installed apps:', error);
      return [];
    }
  }, []);

  return {
    installApk,
    uninstallApk,
    getInstalledApps,
    isInstalling,
    isUninstalling,
    installedApps
  };
};

export default useApk;