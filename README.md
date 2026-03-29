# KalamSync

## 项目概述

KalamSync 是一个基于 Electron + React + Redux 的跨平台 Android 文件传输应用，使用 Kalam 作为 MTP 内核。该应用提供了高效、稳定的文件传输体验，支持 macOS、Windows 和 Linux 操作系统。

## 主要功能

- 支持传输大于 4GB 的文件
- 支持同时连接多个 Android 设备
- 无线传输模式
- 批量文件操作
- 文件同步功能
- 文件搜索与过滤
- 文件预览功能
- 多标签页支持
- 自定义主题
- 端到端加密传输
- 跨设备剪贴板共享
- 在电脑上显示 Android 通知
- 安装/卸载 APK
- 可视化存储空间使用情况
- 大文件/重复文件检测

## 系统要求

- **macOS**：11.0 (Big Sur) 或更高版本
- **Windows**：Windows 10 或更高版本
- **Linux**：Ubuntu 20.04 或更高版本
- **Android 设备**：支持 MTP 协议的设备
- **USB 连接**：USB 2.0 或更高版本

## 技术栈

- **前端框架**：React 18
- **状态管理**：Redux
- **构建工具**：Webpack 5
- **打包工具**：Electron Builder
- **MTP 内核**：Kalam (Go 语言实现)
- **开发环境**：Node.js 16+

## 安装指南

### macOS

1. 从 [GitHub Releases](https://github.com/luyang668899/KalamSync/releases) 下载最新的 DMG 文件
2. 打开 DMG 文件并将 KalamSync 拖放到 Applications 文件夹
3. 首次打开时，可能需要在系统偏好设置中允许应用运行

### Windows

1. 从 [GitHub Releases](https://github.com/luyang668899/KalamSync/releases) 下载最新的 EXE 安装文件
2. 运行安装文件并按照提示完成安装

### Linux

1. 从 [GitHub Releases](https://github.com/luyang668899/KalamSync/releases) 下载最新的 AppImage 文件
2. 使 AppImage 文件可执行：`chmod +x KalamSync-*.AppImage`
3. 运行 AppImage 文件

## 开发指南

### 环境要求

- Node.js 16+
- Yarn
- Git

### 克隆仓库

```bash
git clone https://github.com/luyang668899/KalamSync.git
cd KalamSync
```

### 安装依赖

```bash
# 安装 Yarn（如果未安装）
npm install -g yarn

# 安装项目依赖
yarn
```

### 启动开发服务器

```bash
# 首次运行或遇到状态错误时
echo "UPGRADE_EXTENSIONS=1" > .env.local
yarn dev

# 正常开发
yarn dev
```

### 构建和打包

```bash
# 构建项目
yarn build

# 打包当前平台
yarn package

# 打包所有平台
yarn package-all
```

## 项目结构

详细的项目结构请参考 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) 文件。

## 使用指南

详细的使用说明请参考 [USER_GUIDE.md](USER_GUIDE.md) 文件。

## 贡献指南

我们欢迎社区贡献！请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 文件了解如何贡献代码。

## 许可证

KalamSync 采用 MIT 许可证。详情请参考 [LICENSE](LICENSE) 文件。

## 联系信息

- **邮箱**：luyang2022@outlook.com
- **GitHub**：[https://github.com/luyang668899/KalamSync](https://github.com/luyang668899/KalamSync)