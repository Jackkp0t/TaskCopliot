# Pi Agent SDK adapter mapping

当前应用默认使用 `FakeModelPort`，不会调用真实模型。真实模型模式由真人配置 `AI_MODE=real` 和 `PI_MODEL` 后启用。

## Mapping

| Product port | Pi SDK v0.84.2 |
| --- | --- |
| `ModelPort.decide` | `createAgentSession` + `session.prompt` |
| Streaming text | `session.subscribe` 的 `message_update` / `text_delta` |
| Cancellation | `AbortSignal` 触发 `session.abort()` |
| Tools | 当前使用 `noTools: 'all'`，后续通过 `defineTool` 和 allowlist 接入只读任务工具 |
| Result | Structured JSON parsed into `AgentResult` |
| Provider errors | Adapter 内转换为 Runtime 的 `run_failed` |

原始 Pi SDK 事件不会直接暴露给 HTTP API；外部只消费产品级 `AgentEvent`。
