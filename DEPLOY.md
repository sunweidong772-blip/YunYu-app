# 云屿 Web App 4.2.8 部署说明

## 本地运行
进入 yunyu-web：
npm install
npm run dev

## 前端打包
npm run build

生成 dist 目录后可部署到静态网站服务器。

## 后端
backend 目录保留原 Node.js 服务。部署时需要：
1. 配置 PostgreSQL
2. 导入 schema.sql
3. 安装后端依赖
4. 配置前端的后端 API 地址

## PWA
本版本已加入 manifest.webmanifest，为后续“添加到手机桌面”做准备。
