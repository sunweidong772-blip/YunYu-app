# 云屿 · Android APK 打包指南

## 概述

云屿已集成 **Capacitor v5**，可将 Vue3 前端打包为原生 Android APK。Capacitor 会将你的 Web 应用包装在原生 WebView 中，同时提供访问原生设备能力（相机、推送通知等）的桥梁。

## 打包前准备

### 1. 开发环境要求

| 工具 | 版本要求 | 下载链接 |
|------|----------|----------|
| Node.js | >= 18 | https://nodejs.org/ |
| Java JDK | 17 (推荐) | https://adoptium.net/ |
| Android Studio | 最新版 | https://developer.android.com/studio |
| Android SDK | API 33+ | 通过 Android Studio 安装 |
| Gradle | 8.x | 已包含在项目内 |

### 2. 配置 Android SDK 环境变量

```bash
# Linux/macOS (添加到 ~/.bashrc 或 ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Windows (添加到系统环境变量)
# ANDROID_HOME = C:\Users\<用户名>\AppData\Local\Android\Sdk
```

### 3. 验证环境

```bash
# 检查 Node.js
node --version  # >= v18.x

# 检查 Java
java -version   # >= 17

# 检查 Android SDK
adb --version   # 应显示版本号

# 检查 Capacitor
npx cap --version  # 应 >= 5.x
```

## 快速打包步骤

### 方式一：命令行一键打包（推荐）

```bash
# 1. 进入项目目录
cd yunyu-app/frontend

# 2. 安装依赖（如果尚未安装）
npm install

# 3. 构建前端
npm run build

# 4. 同步到 Android 项目
npx cap sync android

# 5. 打包 APK
cd android
./gradlew assembleRelease

# 6. 查找生成的 APK
ls app/build/outputs/apk/release/
# 输出: app-release-unsigned.apk
```

### 方式二：Android Studio 图形界面打包

1. **打开项目**：启动 Android Studio → Open → 选择 `yunyu-app/frontend/android`
2. **同步项目**：等待 Gradle 同步完成（首次可能需要下载依赖，约 5-10 分钟）
3. **构建 APK**：
   - 菜单栏 → Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 或 Build → Generate Signed Bundle / APK → APK
4. **查找 APK**：Build 完成后右下角会弹出通知，点击 "locate" 即可找到 APK 文件

## 应用签名（发布到应用商店必需）

### 创建签名密钥（首次只需要执行一次）

```bash
# 进入 android 目录
cd yunyu-app/frontend/android

# 生成密钥库（KeyStore）
keytool -genkey -v -keystore yunyu-release-key.keystore -alias yunyu -keyalg RSA -keysize 2048 -validity 10000

# 按提示填写：
# - 密钥库密码: 建议 16 位以上强密码
# - 姓名: 你的姓名或公司名
# - 组织单位: 可选
# - 组织: 你的公司名
# - 城市: 你的城市
# - 省份: 你的省份
# - 国家代码: CN
```

**⚠️ 重要**：妥善保管 `yunyu-release-key.keystore` 文件和密码，丢失后无法更新应用！

### 配置自动签名

在项目 `android/app/build.gradle` 中添加签名配置：

```gradle
android {
    // ... 现有配置
    
    signingConfigs {
        release {
            storeFile file("yunyu-release-key.keystore")
            storePassword "你的密钥库密码"
            keyAlias "yunyu"
            keyPassword "你的密钥密码"
        }
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release  // 使用签名配置
        }
    }
}
```

**安全建议**：不要把密码硬编码在代码中，可以使用环境变量：

```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("YUNYU_KEYSTORE") ?: "yunyu-release-key.keystore")
        storePassword System.getenv("YUNYU_KEYSTORE_PASSWORD")
        keyAlias System.getenv("YUNYU_KEY_ALIAS") ?: "yunyu"
        keyPassword System.getenv("YUNYU_KEY_PASSWORD")
    }
}
```

打包时设置环境变量：

```bash
export YUNYU_KEYSTORE_PASSWORD="你的密码"
export YUNYU_KEY_PASSWORD="你的密码"
./gradlew assembleRelease
```

### 验证签名

```bash
# 检查 APK 签名信息
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release.apk

# 使用 apksigner（推荐，Android 7.0+）
$ANDROID_HOME/build-tools/33.0.0/apksigner verify -v app/build/outputs/apk/release/app-release.apk
```

## 打包完成后的 APK 文件

| 类型 | 文件路径 | 说明 |
|------|----------|------|
| 未签名调试版 | `app/build/outputs/apk/debug/app-debug.apk` | 开发测试用 |
| 未签名发布版 | `app/build/outputs/apk/release/app-release-unsigned.apk` | 需签名后才能安装 |
| 已签名发布版 | `app/build/outputs/apk/release/app-release.apk` | 可直接安装或上架 |

## 安装到设备

### 通过 USB 调试安装

```bash
# 1. 开启手机开发者模式
# 设置 → 关于手机 → 连续点击"版本号"7次 → 返回 → 开发者选项 → 开启"USB调试"

# 2. 连接手机到电脑
adb devices
# 应显示设备列表

# 3. 安装 APK
adb install -r app/build/outputs/apk/release/app-release.apk

# 4. 查看日志
adb logcat | grep -i "yunyu\|capacitor\|chromium"
```

### 通过文件传输安装

1. 将 APK 文件复制到手机
2. 在手机上点击 APK 文件安装
3. 可能需要在设置中允许"安装未知来源应用"

## 常见问题

### Q1: Gradle 同步失败 / 下载依赖慢

**解决**：配置国内镜像

编辑 `android/build.gradle`：

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        // 国内镜像（阿里云）
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    }
}
```

### Q2: 打包时出现 "Duplicate class" 错误

**解决**：清理并重新构建

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### Q3: APK 安装后白屏 / 无法加载

**解决**：
1. 检查 `capacitor.config.json` 中的 `server.url` 是否正确
2. 确保前端已构建：`npm run build`
3. 重新同步：`npx cap sync android`
4. 查看日志：`adb logcat | grep -i "console"`

### Q4: 应用图标未更新

**解决**：
1. 替换 `android/app/src/main/res/mipmap-*/` 下的图标文件
2. 文件名必须保持一致：`ic_launcher.png` / `ic_launcher_round.png`
3. 清除应用缓存或重新安装

### Q5: 网络请求失败（CORS / 安全策略）

**解决**：
1. 确保后端 API 已部署并可通过外网访问
2. 修改 `capacitor.config.json` 中的 `server.url` 为实际域名
3. 后端需配置 CORS 允许移动端域名

### Q6: 文件过大

**解决**：
1. 检查 `android/app/src/main/assets/public/` 是否有不必要的文件
2. 前端构建时启用代码分割（Vite 默认已开启）
3. 使用 ProGuard 压缩：在 `build.gradle` 中设置 `minifyEnabled true`

## 应用商店上架

### Google Play

1. 注册 Google Play 开发者账号（$25 一次性费用）
2. 创建应用 → 填写应用信息
3. 上传已签名的 AAB（App Bundle）或 APK
4. 填写内容分级问卷
5. 设置定价和分发地区
6. 提交审核（通常 1-3 天）

**生成 AAB（推荐，Play 商店首选格式）**：

```bash
cd android
./gradlew bundleRelease
# 输出: app/build/outputs/bundle/release/app-release.aab
```

### 国内应用商店（华为、小米、OPPO、vivo、应用宝等）

1. 注册各平台开发者账号（通常需要企业资质）
2. 上传已签名的 APK
3. 填写应用信息、截图、描述
4. 提交审核（通常 1-7 天）

**注意事项**：
- 国内商店可能需要 ICP 备案号
- 确保应用符合《移动互联网应用程序信息服务管理规定》
- 隐私政策需在应用内和商店页面同时展示

## 后续更新

### 更新应用版本

1. 修改 `android/app/build.gradle` 中的版本号：

```gradle
defaultConfig {
    versionCode 2        // 每次更新 +1
    versionName "1.1.0"  // 版本名称
}
```

2. 重新构建并签名
3. 上传到新版本

### 同步前端更新

```bash
cd yunyu-app/frontend

# 1. 更新前端代码
# ...

# 2. 重新构建
npm run build

# 3. 同步到 Android
npx cap sync android

# 4. 重新打包
cd android
./gradlew assembleRelease
```

## Capacitor 插件扩展

如需使用原生能力，可安装官方插件：

```bash
# 相机
npm install @capacitor/camera
npx cap sync android

# 推送通知
npm install @capacitor/push-notifications
npx cap sync android

# 本地存储
npm install @capacitor/preferences
npx cap sync android

# 文件系统
npm install @capacitor/filesystem
npx cap sync android

# 地理位置
npm install @capacitor/geolocation
npx cap sync android
```

然后在 Vue 组件中使用：

```javascript
import { Camera, CameraResultType } from '@capacitor/camera'

async function takePhoto() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  })
  // image.webPath 可用于显示照片
}
```

## 性能优化

### 1. 启用代码分割（已默认开启）

Vite 构建时会自动代码分割，无需额外配置。

### 2. 图片优化

- 使用 WebP 格式
- 提供多尺寸图标（已配置）
- 懒加载非首屏图片

### 3. 启用 ProGuard（可选）

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 4. 使用 App Bundle

```bash
./gradlew bundleRelease
```

AAB 格式比 APK 小 15-20%，Play 商店会自动为每个设备生成最优 APK。

## 参考资源

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Capacitor Android 配置](https://capacitorjs.com/docs/android/configuration)
- [Android 开发者指南](https://developer.android.com/guide)
- [Google Play 上架指南](https://developer.android.com/distribute/best-practices/launch/)

---

**提示**：首次打包可能需要 10-20 分钟下载依赖，后续打包只需 1-2 分钟。建议在 CI/CD 流水线中自动执行打包流程。
