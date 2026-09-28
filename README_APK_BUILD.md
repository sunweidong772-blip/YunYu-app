# 云屿 APK 自动构建项目

本项目已配置 GitHub Actions，推送到 GitHub 仓库后自动构建 Android APK。

## 使用步骤

### 1. 创建 GitHub 仓库
- 访问 https://github.com/new
- 创建新仓库（名称随意，如 `yunyu-apk`）
- 不要勾选 README、.gitignore、license

### 2. 推送代码
```bash
cd yunyu-apk-build
git init
git add .
git commit -m "init yunyu apk build"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 3. 触发构建
推送后自动触发，或进入仓库 → Actions → Build YunYu APK → Run workflow 手动触发。

### 4. 下载 APK
构建完成后：
- 进入仓库 → Actions → 最新 workflow run
- 页面底部找到 Artifacts → `yunyu-apk`
- 下载解压即可获得 `app-release-unsigned.apk`

### 5. 签名 APK（可选，不签名也能安装测试）
如需上架应用市场，使用 `apksigner` 或 Android Studio 签名。

## 项目结构

```
yunyu-apk-build/
├── .github/workflows/build-apk.yml  # GitHub Actions 工作流
├── yunyu-web/                      # 前端源码 + Capacitor Android 项目
│   ├── android/                    # Android 原生项目（GitHub Actions 构建目标）
│   ├── dist/                       # 构建产物（React → 静态文件）
│   ├── src/                        # React 源码
│   ├── capacitor.config.json       # Capacitor 配置
│   └── package.json
└── backend/                        # Node.js 后端（APK 中不包含）
```

## 后端地址配置

APK 默认连接 `http://localhost:3000`。用户首次打开需在"我的 → 后端连接设置"中填入实际后端地址，例如：
- `http://8.160.178.28:3000`（你的服务器）
- 或你自己的后端 URL

## 注意事项

1. **APK 中的后端**：此 APK 只包含前端页面，后端仍需独立部署在服务器上
2. **网络权限**：已配置 `android.permission.INTERNET`，可访问外部 API
3. **未签名 APK**：GitHub Actions 输出的是未签名 APK，测试安装无问题；上架需签名
4. **包名**：`com.yunyu.app`，与你的截图配置一致

## 技术栈

- 前端：React + Vite → Capacitor → Android
- 后端：Node.js + PostgreSQL（独立部署）
- 构建：GitHub Actions + Gradle
