# AGENTS.md

## 项目约定

### 范围
- 只改 uniapp 前端：`FastApp`（本仓库）
- **禁止修改**：后端 `FastApi`、Flutter `FastApp`
- 回复使用中文

### 响应式自适应（必须）
以后所有 UI 代码（新页面、新组件、改样式）都要做响应式，对齐首页已有断点与写法：

| 断点 | 行为 |
|------|------|
| 默认（手机 ≤759） | 单列/横滑，字号与间距按手机优化 |
| `max-width: 360px` / `375px` | 收紧字号、边距、图标，避免挤压 |
| `min-width: 768px` | 限宽居中（信息流/推荐功能常用 `720px`，入口区可用 `960px`），避免整屏拉伸 |
| `min-width: 1024px` | 可更宽（如 `1000px`）、宫格换行/多列；卡片仍保持可读宽度 |

参考位置：
- 全局：`static/base.css` →「响应式自适应（首页 / 社区共用）」
- 首页：`pages/home/home.vue` scoped `@media`（含推荐功能区 `.home-feature-*`）
- 社区：`pages/home/square.vue` scoped `@media`

写法要点：
- `box-sizing: border-box`；限宽块用 `max-width + margin: 0 auto`
- 横滑区宽屏可 `flex-wrap` 改宫格
- 避免写死 `width: 100vw` / 固定大 `rpx` 宽导致横滑

### 校验
- 改 `home.vue`/`square.vue` 后：提取 `<script>` 跑 `node --check`
- 检查 `<style>` / `base.css` 花括号配平

### 已完成历史点
- 已删 `sb.520771.xyz` / `FAST_URL`
- 首页轮播对接 `typechoHome/bannerList`
- 首页推荐功能区对接 `typechoHome/featureList`
- 首页四 tab 排序修复
- 首页 + 社区 + 推荐功能区响应式
