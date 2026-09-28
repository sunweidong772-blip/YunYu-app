# 云屿 Web App 4.2.8 最终整理与运行检查

## 本次整理
- 集中 API 地址配置：src/config.js
- 统一请求封装：src/api.js
- 新增 .env.example
- 补充 Vite 配置
- 增加基础 Service Worker
- 保留 Web Manifest 和此前迁移模块

## 运行前必须检查
1. 前端：cd yunyu-web && npm install && npm run dev
2. 后端：进入 backend，安装 package.json 中依赖并启动服务
3. PostgreSQL：创建数据库并导入 schema.sql
4. 将 VITE_API_BASE 改为实际后端地址
5. 使用管理员账号验证后台接口权限

## 注意
不同原始接口的具体路径、字段和权限规则必须以 4.2.8 backend/server.js 为准。
上线前应逐项执行登录、发帖、评论、聊天、应用发布、审核和公告测试。


## 本轮修复
- 重建主入口，移除之前多轮追加造成的未定义组件引用风险
- 页面统一为单一 API 客户端
- 对齐后端 server.js 已存在的核心路由
- 统一帖子、评论、应用、私信、收藏、签到、个人中心与后台入口
