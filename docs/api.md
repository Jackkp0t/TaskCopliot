# API 文档

## `GET /api/tasks`

查询参数：`status`、`priority`、`tag`、`category`、`search`、`sortBy`、`sortOrder`、`page`、`pageSize`。

## `POST /api/tasks`

```json
{
  "title": "准备周报",
  "description": "整理本周项目进展",
  "priority": "high",
  "tags": ["工作"],
  "category": "工作"
}
```

## `PATCH /api/tasks/:id`

支持修改 `title`、`description`、`status`、`priority`、`tags`、`due_at`、`category` 和 `parent_id`。

## `POST /api/ai/runs`

```json
{
  "mode": "parse_task",
  "input": "提醒我明天下午3点购买日用品",
  "timezone": "Asia/Shanghai"
}
```

AI Run 返回 `runId` 和结构化草稿。`GET /api/ai/runs/:runId/events` 返回 SSE 事件流。
