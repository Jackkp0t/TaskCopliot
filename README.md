# 作息簿 · 智能计划助手

## 岗位方向

AI-LLM / 全栈开发

## 技术栈

- 编程语言：TypeScript
- 框架：React、Vite、Node.js、Express
- 数据库：SQLite、better-sqlite3
- 其他工具：Pi Agent SDK、Zod、Pino、Vitest、Supertest、Testing Library

## 已实现功能

- [X] 任务 CREATE / READ / UPDATE / DELETE
- [X] SQLite 持久化
- [X] 状态、优先级、标签、分类筛选
- [X] 搜索、排序和分页
- [X] 自然语言任务草稿生成
- [X] 截止日期、优先级、标签和分类提取
- [X] 任务拆解草稿与确认后批量创建
- [X] 每日/每周任务摘要
- [X] Mock/Fallback AI 运行模式
- [X] Pi Agent SDK 真实模型适配接口
- [X] SSE Agent Run 事件回放
- [X] 结构化 JSON 日志与敏感信息脱敏
- [X] 单元测试和集成测试
- [X] React 响应式任务仪表盘

## 配置与运行说明

### 1. 前置条件

- Node.js 20+
- npm 10+

### 2. 安装步骤

```bash
npm install
```

### 3. 配置

复制 `.env.example` 为 `.env`，默认使用 Mock 模式：

```env
PORT=3000
DATABASE_PATH=./data/tasks.db
LOG_LEVEL=info
AI_MODE=fallback
```

真实 Pi 模型由真人配置。配置完成后设置：

```env
AI_MODE=real
PI_PROVIDER=<provider>
PI_MODEL=<model>
PI_API_KEY=<provider-specific-secret>
```

API Key 不应提交到 Git。

### 4. 运行应用

启动 API：

```bash
npm run dev
```

启动 React 开发服务器：

```bash
npm run dev:client
```

生产构建：

```bash
npm run build
```

## API 文档

### 任务接口

```text
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

创建示例：

```json
{
  "title": "购买日用品",
  "priority": "medium",
  "tags": ["购物"],
  "category": "生活",
  "due_at": "2026-09-22T07:00:00.000Z"
}
```

列表支持 `status`、`priority`、`tag`、`category`、`search`、`sortBy`、`sortOrder`、`page` 和 `pageSize`。

### AI Run 接口

```text
POST /api/ai/runs
GET  /api/ai/runs/:runId
GET  /api/ai/runs/:runId/events
POST /api/ai/runs/:runId/cancel
```

`mode` 支持：

```text
parse_task
decompose_task
summarize
```

AI 结果先作为草稿返回，用户确认后才通过任务 CRUD 写入数据库。

## 设计决策

- 使用 SQLite：无需外部服务，适合挑战项目，同时保留 Repository 接口方便迁移 PostgreSQL。
- 使用 Express：REST API 结构简单，便于在有限时间内完成完整闭环。
- 使用 Core / Runtime / Adapter 分层：避免 Pi SDK 对领域逻辑产生直接耦合。
- 默认 Mock：没有模型配置时仍可演示自然语言任务、拆解和摘要功能。
- 使用 SSE：实时传递 Agent Run 事件，同时支持从 SQLite 事件日志回放。
- 使用 Pino：输出结构化日志，便于后续接入监控系统。

## 挑战与解决方案

- 自然语言时间解析：Mock 模式使用确定性中文规则；真实模式由 Pi 返回结构化 JSON。
- AI 误写数据：模型只生成草稿，数据库写入必须经过用户确认。
- SDK 变化风险：Pi SDK 只在 `piAdapter.ts` 中使用，并记录 v0.84.2 API 映射。
- SSE 断线：AgentEvent 持久化到 append-only 日志，客户端可以回放完整事件。
- 敏感信息泄露：结构化日志对 Authorization、API Key、Token 和 Password 自动脱敏。

## 测试

```bash
npm run typecheck
npm test
npm run test:integration
npm run build
```

## 未来改进

- 用户认证和权限控制
- PostgreSQL 和 Redis
- 复杂任务依赖图
- 向量数据库和语义搜索
- Docker Compose
- GitHub Actions CI/CD
- 多智能体规划与执行

## 所用时间

约 2 小时

## Git 提交说明

项目应按功能拆分提交，例如：

```text
chore: initialize typescript react node project
feat: add task crud api with filtering and pagination
feat: add agent core runtime and fallback adapter
feat: integrate pi agent sdk and ai run streaming
feat: add structured json logging
feat: add react task dashboard and ai panels
test: add unit and integration test coverage
docs: complete readme api and architecture documentation
```
