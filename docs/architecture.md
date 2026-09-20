# 架构说明

系统采用单 Node.js 进程、SQLite 和 React/Vite 的轻量全栈架构。

## 数据流

```text
React
  -> REST / SSE
Express Controller
  -> Service
TaskRepository / AgentRuntime
  -> SQLite / Pi Adapter / Fake Adapter
```

## Agent 分层

- Core：只关心任务、上下文、决策、观察和结果。
- Runtime：负责 Run 生命周期、事件、超时、取消和持久化。
- Adapter：把 Pi SDK 或 Fake Model 映射为统一的 ModelPort。

AI 不直接写任务表。自然语言解析和拆解只生成草稿，用户确认后才调用任务 CRUD。

## 日志

Pino 记录 HTTP 请求、Agent Run、工具调用、错误和耗时。AgentEvent 是业务级运行轨迹，写入 SQLite 后用于 SSE 和回放。

## 当前限制

单用户、无认证、无复杂任务依赖、无向量数据库。默认仅运行 Fake Adapter，真实 Pi 模型由真人配置。
