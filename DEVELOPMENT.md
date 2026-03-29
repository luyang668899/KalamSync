# OpenMTP 开发文档

## 项目概述

OpenMTP 是一个为 macOS 用户设计的 Android 文件传输应用，使用 Electron + React + Redux 架构开发。本文档旨在帮助开发者了解项目结构、开发流程和贡献指南。

## 技术栈

- **前端框架**: React 17.0.2
- **状态管理**: Redux 4.0.5
- **构建工具**: Webpack 5.76.0
- **打包工具**: Electron Builder 23.0.3
- **MTP 内核**: Kalam (Go 语言实现)
- **开发环境**: Node.js 16+

## 系统要求

- **开发环境**: macOS 11.0 (Big Sur) 或更高版本
- **Node.js**: v16 或更高版本
- **包管理器**: Yarn
- **Git**: 最新版本

## 开发流程

### 1. 克隆仓库

```bash
git clone https://github.com/ganeshrvel/openmtp.git
cd openmtp
```

### 2. 安装依赖

```bash
# 安装 Yarn（如果未安装）
npm install -g yarn

# 安装项目依赖
yarn
```

### 3. 启动开发服务器

```bash
# 首次运行或遇到状态错误时
echo "UPGRADE_EXTENSIONS=1" > .env.local
yarn dev

# 正常开发
yarn dev
```

### 4. 构建和打包

```bash
# 构建项目
yarn build

# 打包当前平台
yarn package

# 打包所有平台（macOS, Windows, Linux）
yarn package-all

# 仅打包 macOS
yarn package-mac

# 仅打包 Windows
yarn package-win

# 仅打包 Linux
yarn package-linux
```

## 项目结构

### 核心目录

- **`/app`**: 主应用代码
  - **`/components`**: React 组件
  - **`/containers`**: 容器组件（Redux 连接）
  - **`/services`**: 服务模块
  - **`/data`**: 数据层（数据源、仓库、控制器）
  - **`/constants`**: 常量定义
  - **`/helpers`**: 辅助函数
  - **`/utils`**: 工具函数
  - **`/styles`**: 样式文件
  - **`/store`**: Redux store 配置

- **`/ffi`**: 外部函数接口
  - **`/kalam`**: Kalam MTP 内核

- **`/webpack`**: Webpack 配置

- **`/config`**: 应用配置

- **`/internals`**: 内部脚本和工具

### 主要文件

- **`app/main.dev.js`**: 主进程入口
- **`app/index.js`**: 渲染进程入口
- **`app/app.html`**: 主 HTML 模板
- **`package.json`**: 项目配置和依赖
- **`electron-builder-config.js`**: Electron Builder 配置

## 代码规范

- **ESLint**: 代码风格检查
- **Prettier**: 代码格式化
- **Stylelint**: CSS/SCSS 风格检查

### 运行代码检查

```bash
# 运行 ESLint
yarn lint

# 运行 Stylelint
yarn lint-styles

# 自动修复 ESLint 错误
yarn lint-fix

# 自动修复 Stylelint 错误
yarn lint-styles-fix
```

## 调试指南

### 开发模式调试

1. 启动开发服务器: `yarn dev`
2. 打开 Chrome 浏览器
3. 访问 `http://localhost:4642`
4. 使用 Chrome 开发者工具进行调试

### 打包应用调试

```bash
# 启动打包后的应用并开启调试端口
"/path/to/OpenMTP.app/Contents/MacOS/OpenMTP" --remote-debugging-port=6363
```

1. 打开 Chrome 浏览器
2. 访问 `about://inspect`
3. 添加新连接 `localhost:6363`
4. 点击 "inspect" 开始调试

## 贡献指南

### 提交代码

1. 创建新分支
2. 编写代码
3. 运行测试和代码检查
4. 提交 Pull Request

### 代码审查

- 确保代码符合项目风格规范
- 提供清晰的 commit 消息
- 包含必要的测试
- 详细描述代码变更

### 问题报告

如果发现 bug 或有功能建议，请在 GitHub Issues 中报告：

1. 访问 [https://github.com/ganeshrvel/openmtp/issues](https://github.com/ganeshrvel/openmtp/issues)
2. 点击 "New Issue"
3. 选择合适的模板
4. 填写详细信息

## 发布流程

### 本地发布

1. 配置代码签名（macOS）
2. 运行 `yarn package` 或 `yarn package-all`
3. 发布到 GitHub Releases

### CI/CD 发布

项目使用 CodeMagic.io 进行 CI/CD 发布：

1. 配置环境变量
2. 触发 CI 工作流
3. 自动构建和发布

## 技术架构

### 数据流

1. **渲染进程**：用户界面和交互
2. **主进程**：与系统和设备交互
3. **Kalam 内核**：MTP 设备通信
4. **Redux Store**：状态管理

### 核心服务

- **FileExplorerService**：文件浏览和操作
- **TransferQueueManager**：文件传输队列管理
- **BackupService**：设备备份
- **WirelessService**：无线设备管理
- **ApkService**：APK 安装/卸载
- **StorageService**：存储分析
- **FileAnalysisService**：文件分析
- **NotificationService**：通知管理
- **ClipboardService**：剪贴板同步
- **I18nService**：国际化
- **AccessibilityService**：辅助功能

## 常见问题

### 设备未被识别

- 确保设备已开启 MTP 模式
- 检查 USB 连接
- 尝试重新插拔设备
- 查看应用日志获取详细信息

### 构建失败

- 检查 Node.js 和 Yarn 版本
- 确保依赖已正确安装
- 检查代码签名配置

### 性能问题

- 使用 Chrome 开发者工具分析性能
- 检查内存使用情况
- 优化渲染和状态更新

## 资源

- **GitHub 仓库**：[https://github.com/ganeshrvel/openmtp](https://github.com/ganeshrvel/openmtp)
- **Kalam 内核**：[https://github.com/ganeshrvel/go-mtpx](https://github.com/ganeshrvel/go-mtpx)
- **Electron 文档**：[https://www.electronjs.org/docs](https://www.electronjs.org/docs)
- **React 文档**：[https://reactjs.org/docs](https://reactjs.org/docs)
- **Redux 文档**：[https://redux.js.org/docs](https://redux.js.org/docs)

## 联系信息

- **作者**：Ganesh Rathinavel
- **邮箱**：ganeshrvel@outlook.com
- **GitHub**：[https://github.com/ganeshrvel](https://github.com/ganeshrvel)