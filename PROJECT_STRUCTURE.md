**[KalamSync](https://github.com/luyang668899/KalamSync)**

项目结构

## 项目概述

OpenMTP 是一个基于 Electron + React + Redux 的 Android 文件传输应用，使用 Kalam 作为 MTP 内核。本文档详细描述了项目的目录结构和文件组织。

## 根目录结构

```
├── app/               # 主应用代码
├── blobs/             # 二进制文件和资源
├── build/             # 构建输出目录
├── config/            # 应用配置
├── docs/              # 生成的文档
├── docs-sources/      # 文档源文件
├── ffi/               # 外部函数接口
├── internals/         # 内部脚本和工具
├── scripts/           # 脚本文件
├── webpack/           # Webpack 配置
├── .eslintignore      # ESLint 忽略文件
├── .eslintrc.js       # ESLint 配置
├── .gitignore         # Git 忽略文件
├── .huskyrc           # Husky 配置
├── .prettierrc        # Prettier 配置
├── .stylelintrc       # Stylelint 配置
├── CONTRIBUTING.md    # 贡献指南
├── DEVELOPMENT.md     # 开发文档
├── LICENSE            # 许可证文件
├── README.md          # 项目说明
├── USER_GUIDE.md       # 使用说明书
├── babel.config.js    # Babel 配置
├── codemagic.yaml     # CodeMagic CI/CD 配置
├── electron-builder-config.js  # Electron Builder 配置
├── lint-staged.config.js       # Lint-staged 配置
├── package.json       # 项目配置和依赖
├── sample.env         # 环境变量示例
├── sample.sentry.properties  # Sentry 配置示例
├── sentry-symbols.js  # Sentry 符号上传脚本
└── yarn.lock          # Yarn 依赖锁文件
```

## 核心目录详解

### 1. `/app` - 主应用代码

这是应用的核心代码目录，包含所有的 React 组件、Redux 状态管理、服务和工具。

#### 1.1 `/app/components` - React 组件

```
├── Breadcrumb/           # 面包屑导航组件
├── DialogBox/            # 对话框组件
│   ├── components/       # 对话框子组件
│   └── styles/           # 对话框样式
├── LoadingIndicator/     # 加载指示器组件
├── Snackbars/            # 提示消息组件
├── styles/               # 组件样式
├── AccessibilitySettings.jsx  # 辅助功能设置
├── ApkManager.jsx        # APK 管理器
├── AuditLogViewer.jsx     # 审计日志查看器
├── BackupManager.jsx      # 备份管理器
├── CLIManager.jsx        # 命令行接口管理器
├── ClipboardSettings.jsx  # 剪贴板设置
├── FileAnalyzer.jsx       # 文件分析器
├── LanguageSelector.jsx   # 语言选择器
├── MtpDeviceManager.jsx   # MTP 设备管理器
├── NotificationList.jsx   # 通知列表
├── NotificationSettings.jsx  # 通知设置
├── ShortcutsManager.jsx  # 快捷键管理器
├── StorageAnalyzer.jsx    # 存储分析器
├── TransferQueueManager.jsx  # 传输队列管理器
└── WirelessManager.jsx    # 无线设备管理器
```

#### 1.2 `/app/containers` - 容器组件

容器组件负责连接 Redux store 和展示组件。

```
├── Alerts/               # 警报容器
├── App/                  # 主应用容器
├── AppFeaturesPage/      # 应用功能页面
├── AppUpdatePage/        # 应用更新页面
├── ErrorBoundary/        # 错误边界
├── HelpFaqsPage/         # 帮助和常见问题页面
├── HomePage/             # 主页
│   ├── components/       # 主页子组件
│   └── styles/           # 主页样式
├── KeyboardShortcutsPage/  # 键盘快捷键页面
├── NotFoundPage/         # 404页面
├── Onboarding/           # 引导页面
├── PrivacyPolicyPage/    # 隐私政策页面
├── ReportBugsPage/       # 报告bug页面
└── Settings/             # 设置页面
```

#### 1.3 `/app/services` - 服务模块

服务模块提供各种功能的核心逻辑。

```
├── analytics/            # 分析服务
├── i18n/                 # 国际化服务
├── ipc-events/           # IPC事件处理
├── sentry/               # Sentry 错误监控
├── AccessibilityService.js  # 辅助功能服务
├── ApkService.js         # APK 管理服务
├── ApkServiceMain.js     # 主进程 APK 服务
├── AuditLogService.js    # 审计日志服务
├── BackupService.js      # 备份服务
├── BackupServiceMain.js  # 主进程备份服务
├── CLIService.js         # 命令行接口服务
├── ClipboardService.js   # 剪贴板服务
├── ClipboardServiceMain.js  # 主进程剪贴板服务
├── EncryptionService.js  # 加密服务
├── FileAnalysisService.js  # 文件分析服务
├── FileAnalysisServiceMain.js  # 主进程文件分析服务
├── NotificationService.js  # 通知服务
├── NotificationServiceMain.js  # 主进程通知服务
├── PermissionService.js  # 权限服务
├── ShortcutsService.js   # 快捷键服务
├── StorageService.js     # 存储服务
├── StorageServiceMain.js  # 主进程存储服务
├── WirelessService.js    # 无线服务
├── WirelessServiceMain.js  # 主进程无线服务
├── useAccessibility.js   # 辅助功能 Hook
├── useApk.js            # APK 管理 Hook
├── useClipboard.js       # 剪贴板 Hook
├── useFileAnalysis.js    # 文件分析 Hook
├── useNotification.js    # 通知 Hook
└── useStorage.js         # 存储 Hook
```

#### 1.4 `/app/data` - 数据层

数据层负责与设备和文件系统的交互。

```
└── file-explorer/        # 文件浏览器数据
    ├── controllers/      # 控制器
    ├── data-sources/     # 数据源
    ├── repositories/     # 仓库
    └── services/         # 服务
```

#### 1.5 `/app/constants` - 常量定义

```
├── dom.js              # DOM 相关常量
├── env.js              # 环境常量
├── index.js            # 常量导出
├── keymaps.js          # 键盘映射
├── meta.js             # 元数据
├── onboarding.js       # 引导流程常量
├── paths.js            # 路径常量
└── serviceKeys.js      # 服务键
```

#### 1.6 `/app/helpers` - 辅助函数

```
├── binaries.js         # 二进制文件处理
├── bootHelper.js       # 启动辅助
├── console.js          # 控制台工具
├── createWindows.js    # 创建窗口
├── deviceInfo.js       # 设备信息
├── fileOps.js          # 文件操作
├── identifiers.js      # 标识符
├── logs.js             # 日志
├── processBufferOutput.js  # 处理缓冲区输出
├── reducerPrefixer.js  # Reducer 前缀
├── remoteWindowHelpers.js  # 远程窗口辅助
├── settings.js         # 设置
├── storageHelper.js    # 存储辅助
├── theme.js            # 主题
├── titlebarDoubleClick.js  # 标题栏双击
└── windowHelper.js     # 窗口辅助
```

#### 1.7 `/app/utils` - 工具函数

```
├── checkIf.js          # 条件检查
├── date.js             # 日期处理
├── errors.js           # 错误处理
├── eventHandling.js    # 事件处理
├── files.js            # 文件处理
├── funcs.js            # 通用函数
├── getPlatform.js      # 获取平台
├── gzip.js             # GZIP 处理
├── imgsrc.js           # 图片资源
├── isGoogleAndroidFileTransferActive.js  # 检查 Google Android File Transfer 是否活跃
├── isOnline.js         # 检查在线状态
├── isPackaged.js       # 检查是否打包
├── log.js              # 日志
├── pkginfo.js          # 包信息
├── process.js          # 进程处理
├── styleResets.js      # 样式重置
├── styles.js           # 样式工具
└── url.js              # URL 处理
```

#### 1.8 `/app/styles` - 样式文件

```
├── js/                 # JavaScript 样式
│   ├── index.js        # 样式导出
│   ├── mixins.js       # 样式混合
│   └── variables.js    # 样式变量
└── scss/               # SCSS 样式
    ├── base/           # 基础样式
    ├── themes/         # 主题样式
    └── app.global.scss  # 全局样式
```

#### 1.9 `/app/store` - Redux Store 配置

```
└── configureStore/      # Store 配置
    ├── dev.js          # 开发环境配置
    ├── index.js        # 配置导出
    └── prod.js         # 生产环境配置
```

#### 1.10 `/app/templates` - 模板文件

```
├── appFeaturesPage.js  # 应用功能页面模板
├── fileExplorer.js     # 文件浏览器模板
├── generateErrorReport.js  # 错误报告模板
├── helpFaqsPage.js     # 帮助页面模板
├── keyboardShortcutsPage.js  # 键盘快捷键页面模板
├── loadProfileError.js  # 加载配置错误模板
├── menu.js             # 菜单模板
├── privacyPolicyPage.js  # 隐私政策页面模板
└── socialMediaShareBtns.js  # 社交媒体分享按钮模板
```

### 2. `/ffi` - 外部函数接口

```
└── kalam/              # Kalam MTP 内核
    ├── native/         # 原生代码
    └── src/             # 源代码
```

### 3. `/webpack` - Webpack 配置

```
├── config.base.js            # 基础配置
├── config.eslint.js          # ESLint 配置
├── config.main.prod.babel.js  # 主进程生产配置
├── config.renderer.dev.babel.js  # 渲染进程开发配置
├── config.renderer.dev.dll.babel.js  # 渲染进程开发 DLL 配置
└── config.renderer.prod.babel.js  # 渲染进程生产配置
```

### 4. `/config` - 应用配置

```
└── env/                # 环境配置
    ├── env.dev.js      # 开发环境
    └── index.js        # 配置导出
```

### 5. `/internals` - 内部脚本和工具

```
└── scripts/            # 脚本
    ├── AfterPack.js    # 打包后处理
    ├── CheckBuildExist.js  # 检查构建是否存在
    ├── CheckNodeEnv.js  # 检查 Node 环境
    ├── CheckPortInUse.js  # 检查端口是否被占用
    ├── CheckYarn.js     # 检查 Yarn
    ├── Notarize.js     # 应用公证
    ├── OptionalDepsInstall.js  # 可选依赖安装
    ├── preinstall.sh    # 预安装脚本
    └── semver.js       # 语义版本处理
```

### 6. `/scripts` - 脚本文件

```
└── cicd/               # CI/CD 脚本
    ├── axios.mjs       # Axios 配置
    ├── base.mjs        # 基础脚本
    ├── codemagic-publish-builds.mjs  # CodeMagic 发布构建
    ├── codemagic-start-mac-intel-x64-vm.mjs  # 启动 Mac Intel 虚拟机
    └── constants.mjs   # 常量
```

## 主要文件说明

### 1. 入口文件

- **`app/main.dev.js`**: 主进程入口文件
- **`app/index.js`**: 渲染进程入口文件
- **`app/app.html`**: 主 HTML 模板

### 2. 配置文件

- **`package.json`**: 项目配置和依赖
- **`electron-builder-config.js`**: Electron Builder 配置
- **`babel.config.js`**: Babel 配置
- **`webpack/config.base.js`**: Webpack 基础配置

### 3. 文档文件

- **`README.md`**: 项目说明
- **`DEVELOPMENT.md`**: 开发文档
- **`USER_GUIDE.md`**: 使用说明书
- **`CONTRIBUTING.md`**: 贡献指南
- **`LICENSE`**: 许可证文件

## 技术架构

### 1. 前端架构

- **React**: 用于构建用户界面
- **Redux**: 用于状态管理
- **React Router**: 用于路由管理
- **Styled Components**: 用于组件样式
- **Material UI**: 用于UI组件

### 2. 后端架构

- **Electron**: 用于跨平台桌面应用
- **Kalam**: 用于 MTP 设备通信
- **Node.js**: 用于后端逻辑

### 3. 数据流

1. **渲染进程**：用户界面和交互
2. **主进程**：与系统和设备交互
3. **Kalam 内核**：MTP 设备通信
4. **Redux Store**：状态管理

## 构建流程

1. **开发模式**：`yarn dev` - 启动开发服务器
2. **构建**：`yarn build` - 构建应用
3. **打包**：`yarn package` - 打包应用
4. **发布**：通过 CI/CD 发布到 GitHub Releases

## 部署流程

1. **本地部署**：使用 `yarn package` 打包并安装
2. **CI/CD 部署**：通过 CodeMagic 自动构建和发布
3. **Homebrew 部署**：通过 Homebrew Cask 安装

## 总结

OpenMTP 项目采用了清晰的目录结构和模块化设计，使得代码组织更加合理，易于维护和扩展。项目使用了现代化的前端技术栈，结合 Electron 实现了跨平台的桌面应用。通过 Kalam 内核，实现了高效的 MTP 设备通信，为用户提供了流畅的文件传输体验。
