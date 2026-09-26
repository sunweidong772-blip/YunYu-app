# 云屿 · SQLite 并发策略技术文档

> 本文档阐述当前云屿后端使用 better-sqlite3 时的并发处理方案，以及面向不同部署规模时的迁移建议。

## 1. 现状

云屿后端使用 **better-sqlite3**（Node.js 同步 SQLite 驱动），数据库文件位于 `backend/data/yunyu.db`。

- **连接模式**：单连接、同步 API（`db.prepare().run()` / `db.prepare().get()` / `db.prepare().all()`）
- **部署模式**：当前生产环境采用 Node.js 单进程启动（`node src/server.js`）
- **并发场景**：所有 HTTP 请求共享同一个 SQLite 连接实例

## 2. better-sqlite3 的并发特性

better-sqlite3 底层基于 SQLite 的 WAL（Write-Ahead Logging）模式，具有以下关键特性：

### 2.1 WAL 模式的优势

- **读不阻塞写**：多个读事务可以与一个写事务并发执行
- **写不阻塞读**：读事务可以读取到写事务开始前的快照数据
- **崩溃安全**：事务提交后数据立即写入 WAL 文件，主数据库文件在 checkpoint 时更新

### 2.2 并发限制

| 场景 | 行为 |
|------|------|
| 多读者 | ✅ 完全并行，无锁竞争 |
| 单写者 + 多读者 | ✅ 读者不阻塞，写者独占 |
| 多写者 | ❌ 串行化，SQLite 自动加写锁 |
| 跨进程访问 | ⚠️ 需开启 WAL 模式，否则数据库文件被锁定 |

### 2.3 关键参数

当前云屿已配置的 WAL 相关参数（在 `backend/src/db/index.js` 中）：

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;  -- 5秒等待锁释放
```

## 3. 单进程场景（当前方案）

### 3.1 为什么现在够用

- 云屿当前部署为单 Node.js 进程，所有数据库操作在同一个进程内排队
- better-sqlite3 的同步 API 天然避免了 Node.js 异步回调带来的竞态条件
- WAL 模式下读写分离，读查询（如首页聚合、搜索）不会被写操作（如发帖、下载记录）阻塞

### 3.2 性能预期

在单进程 + WAL 模式下，SQLite 的典型性能表现：

| 操作类型 | 吞吐量 | 说明 |
|---------|--------|------|
| 读查询 | 50,000+ QPS | 简单 SELECT |
| 写操作 | 1,000-3,000 TPS | 受单写者限制 |
| 混合负载 | 读占 90% 时总体 QPS 高 | 写排队不影响读 |

对于云屿目前的用户规模（社区型应用，读多写少），单进程 SQLite 完全足够支撑 10,000+ 日活。

## 4. 多进程/集群场景（未来扩展）

当业务增长需要多进程部署时（如 PM2 cluster、Docker 多实例、Kubernetes），SQLite 会面临以下挑战：

### 4.1 跨进程访问的问题

- **文件锁冲突**：多个 Node.js 进程同时打开同一个 `.db` 文件，会导致 `SQLITE_BUSY` 错误
- **WAL 文件膨胀**：多进程频繁写入时 WAL 文件可能膨胀，需要手动 `PRAGMA wal_checkpoint(TRUNCATE)`
- **连接数限制**：SQLite 官方建议单个数据库文件不超过 10 个并发连接

### 4.2 迁移方案

#### 方案 A：连接池 + 队列（低成本过渡）

在切换到 PostgreSQL/MySQL 之前，可以通过以下方式缓解：

1. **进程间通信（IPC）**：主进程独享数据库连接，工作进程通过 IPC 发送查询请求
2. **队列化写入**：使用 Bull/Redis 队列将写操作串行化，读操作直接走 WAL 并发
3. **分库分表**：按模块拆分（用户库、帖子库、软件库），降低单库并发压力

#### 方案 B：迁移到 PostgreSQL（推荐长期方案）

当 DAU 超过 50,000 或需要多机部署时，建议迁移：

| 维度 | SQLite | PostgreSQL |
|------|--------|------------|
| 并发连接 | 单文件限制 | 无上限（需配置） |
| 多进程 | 文件锁冲突 | 天然支持 |
| 集群/主从 | 不支持 | 流复制 |
| JSON 字段 | ✅ | ✅ (jsonb) |
| 全文搜索 | 扩展有限 | pg_trgm / Elasticsearch |
| 运维复杂度 | 极低（单文件） | 中等 |

**迁移路径**：

1. 安装 `pg` 驱动：`npm install pg`
2. 抽象数据库访问层：将 `db.prepare().all()` 封装为 `query()` / `execute()` 接口
3. 双写阶段：SQLite + PostgreSQL 同时写入，验证数据一致性
4. 灰度切流：读流量逐步切到 PostgreSQL
5. 清理下线：停用 SQLite

#### 方案 C：Serverless / 边缘部署

如果未来需要边缘节点部署（如 Cloudflare Workers、Vercel Edge）：

- SQLite 不适合 Serverless（文件系统限制）
- 推荐 **Turso**（SQLite 的 Serverless 版本，基于 libSQL）或 **D1**（Cloudflare）
- 两者兼容 SQLite 语法，迁移成本低

## 5. 当前代码中的最佳实践

云屿已遵循的 SQLite 最佳实践：

1. ✅ **WAL 模式**：已开启，读写并发不阻塞
2. ✅ **幂等建表**：`CREATE TABLE IF NOT EXISTS`，支持增量迁移
3. ✅ **索引优化**：每个表的关键字段都有索引（如 `user_id`、`created_at`、`status`）
4. ✅ **事务封装**：better-sqlite3 的 `.run()` 自动包裹在隐式事务中
5. ✅ **参数化查询**：使用 `?` 占位符，防止 SQL 注入

## 6. 监控与告警建议

建议在生产环境添加以下监控：

```javascript
// 在 server.js 中添加定期检查
setInterval(() => {
  const walSize = fs.statSync('data/yunyu.db-wal').size;
  if (walSize > 100 * 1024 * 1024) { // 100MB
    console.warn('[db] WAL 文件过大，执行 checkpoint');
    db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run();
  }
}, 60000);
```

## 7. 总结

| 阶段 | 方案 | 适用条件 |
|------|------|---------|
| 当前 | 单进程 + better-sqlite3 + WAL | DAU < 10,000 |
| 增长期 | IPC 队列化写入 / 分库 | DAU 10,000-50,000 |
| 规模化 | 迁移 PostgreSQL | DAU > 50,000 / 多机部署 |
| Serverless | Turso / D1 | 边缘节点 / 无服务器 |

SQLite 不是瓶颈——业务增长才是。在云屿当前阶段，专注产品迭代，数据库层无需过度设计。
