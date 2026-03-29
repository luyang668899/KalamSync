import React, { useEffect, useState } from 'react';
import { dialog } from 'electron';
import useApk from '../services/useApk';
import useI18n from '../services/i18n/useI18n';

const ApkManager = ({ deviceId }) => {
  const { installApk, uninstallApk, getInstalledApps, isInstalling, isUninstalling, installedApps } = useApk();
  const { t } = useI18n();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (deviceId) {
      loadInstalledApps();
    }
  }, [deviceId]);

  const loadInstalledApps = async () => {
    try {
      await getInstalledApps(deviceId);
      setError(null);
    } catch (err) {
      setError('Failed to load installed apps');
      console.error(err);
    }
  };

  const handleInstallApk = async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'APK Files', extensions: ['apk'] }
        ]
      });

      if (!canceled && filePaths.length > 0) {
        await installApk(filePaths[0], deviceId);
        await loadInstalledApps();
        setError(null);
      }
    } catch (err) {
      setError('Failed to install APK');
      console.error(err);
    }
  };

  const handleUninstallApk = async (packageName) => {
    try {
      await uninstallApk(packageName, deviceId);
      await loadInstalledApps();
      setError(null);
    } catch (err) {
      setError('Failed to uninstall APK');
      console.error(err);
    }
  };

  return (
    <div className="apk-manager">
      <h3>应用管理</h3>
      
      <div className="apk-actions">
        <button 
          className="install-apk-btn"
          onClick={handleInstallApk}
          disabled={isInstalling}
        >
          {isInstalling ? '安装中...' : '安装APK'}
        </button>
        <button 
          className="refresh-apps-btn"
          onClick={loadInstalledApps}
        >
          刷新应用列表
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="installed-apps">
        <h4>已安装应用</h4>
        {installedApps.length === 0 ? (
          <p>没有已安装的应用</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>应用名称</th>
                <th>包名</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {installedApps.map((app, index) => (
                <tr key={app.packageName}>
                  <td>{app.name || `App ${index + 1}`}</td>
                  <td>{app.packageName}</td>
                  <td>
                    <button 
                      className="uninstall-btn"
                      onClick={() => handleUninstallApk(app.packageName)}
                      disabled={isUninstalling}
                    >
                      {isUninstalling ? '卸载中...' : '卸载'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApkManager;