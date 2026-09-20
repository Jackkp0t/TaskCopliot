# Smart Planner · AI Task Assistant

Smart Planner is a full-stack task planning assistant built with TypeScript, React, Node.js, SQLite, and the Pi Agent SDK. It supports manual task management, natural-language task drafting, human confirmation before persistence, task decomposition, and daily progress summaries.

## Position

AI-LLM / Full Stack

## Technology Stack

- Language: TypeScript
- Frontend: React, Vite
- Backend: Node.js, Express
- Database: SQLite with `better-sqlite3`
- Agent: `@earendil-works/pi-coding-agent@0.84.2`
- Validation: Zod
- Logging: Pino structured JSON logs
- Testing: Vitest, Supertest, Testing Library

## Implemented Features

- [X] Task CRUD: create, read, update, and delete
- [X] SQLite persistence
- [X] Task status, priority, category, tag, search, sorting, and pagination
- [X] Manual task creation
- [X] Natural-language task drafting
- [X] AI extraction of title, description, priority, category, tags, and due date
- [X] Editable AI task confirmation dialog
- [X] Human confirmation gate before an AI draft is written to the database
- [X] Common categories: Work, Life, Study, Health, Finance, Personal, Other
- [X] Task decomposition with editable subtasks and batch confirmation
- [X] Today's summary: what was completed and what remains unfinished
- [X] Sidebar views for all tasks, this week's tasks, and completed tasks
- [X] Mock/fallback AI mode for local development
- [X] Real Pi Agent SDK model adapter driven by `.env`
- [X] SSE Agent Run event replay
- [X] Structured JSON request logs with sensitive-field redaction
- [X] Unit, integration, and client tests
- [X] Responsive React dashboard

## Project Structure

```text
project/
├── README.md
├── README.en.md
├── package.json
├── .gitignore
├── src/
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   └── utils/
├── tests/
└── docs/
```

## Configuration and Running

### 1. Prerequisites

- Node.js 22.19 or newer (required by the pinned Pi Agent SDK)
- npm 10 or newer

### 2. Installation

```bash
npm install
```

### 3. Configuration

Copy `.env.example` to `.env`.

Mock mode is the default:

```env
PORT=3000
DATABASE_PATH=./data/tasks.db
LOG_LEVEL=info
AI_MODE=fallback
```

To use a real Pi model, configure the provider, model, and API key in `.env`:

```env
AI_MODE=real
PI_PROVIDER=deepseek
PI_MODEL=deepseek-flash
PI_API_KEY=<provider-api-key>
```

The server loads `.env` automatically. `PI_API_KEY` is mapped to the provider-specific environment variable in memory and is never logged. The current DeepSeek alias `deepseek-flash` is normalized to the SDK model `deepseek-v4-flash`.

Never commit `.env` or an API key to Git.

### 4. Run the application

Start the API server:

```bash
npm run dev
```

Start the Vite client in a second terminal:

```bash
npm run dev:client
```

Build the frontend for production:

```bash
npm run build
```

The API is available at `http://localhost:3000` by default.

## API Documentation

### Task endpoints

```text
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Create a task:

```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "title": "Buy household supplies",
  "description": "Buy detergent and tissues",
  "priority": "medium",
  "tags": ["shopping"],
  "category": "Life",
  "due_at": "2026-09-22T07:00:00.000Z"
}
```

Task list filters include `status`, `priority`, `tag`, `category`, `search`, `sortBy`, `sortOrder`, `page`, and `pageSize`.

### AI Run endpoints

```text
POST /api/ai/runs
GET  /api/ai/runs/:runId
GET  /api/ai/runs/:runId/events
POST /api/ai/runs/:runId/cancel
```

Create an AI task draft:

```json
{
  "mode": "parse_task",
  "input": "Remind me to buy household supplies at 3 PM tomorrow",
  "timezone": "Asia/Shanghai"
}
```

Supported modes:

```text
parse_task
decompose_task
summarize
```

AI output is returned as a draft. The frontend displays an editable confirmation dialog, and only a human-confirmed draft is sent to `POST /api/tasks`.

## Design Decisions

- SQLite keeps the project self-contained while the repository layer can later be replaced with PostgreSQL or another database.
- Express provides a small and explicit REST API surface.
- Agent Core, Runtime, and SDK Adapter layers keep Pi-specific behavior out of the product domain.
- Mock mode makes the complete workflow testable without credentials or network access.
- Real model configuration is loaded from `.env` and passed through the Pi adapter.
- SSE events provide observable Agent Run progress and replayable execution history.
- Pino emits structured logs with request IDs and sensitive-field redaction.
- AI never writes tasks directly. Human confirmation is required before persistence.

## Challenges and Solutions

- Natural-language date parsing: the Mock adapter uses deterministic Chinese rules, while real mode asks Pi for structured JSON.
- AI-generated data safety: AI returns editable drafts; only the CRUD layer persists confirmed values.
- SDK model selection: the adapter explicitly resolves the configured provider/model and normalizes the DeepSeek model alias.
- Local credential permissions: the adapter uses an ignored project-local Pi auth path instead of relying on an inaccessible default path.
- Summary scope: today's tasks are identified by `due_at`, `created_at`, or `updated_at` in the requested timezone.
- SSE replay: Agent events are persisted in SQLite and can be replayed from the run event endpoint.

## Testing

Run all tests:

```bash
npm test
```

Run integration tests only:

```bash
npm run test:integration
```

Run type checking and production build:

```bash
npm run typecheck
npm run build
```

The test suite covers task validation, service logic, Agent Core behavior, Pi configuration, REST APIs, SSE events, navigation views, AI confirmation, manual creation, and the summary panel.

## Future Improvements

- Authentication and multi-user permissions
- PostgreSQL and Redis support
- Recurring tasks and calendar integration
- Rich task dependencies and timeline views
- Vector search and semantic task retrieval
- Docker Compose and CI/CD workflows
- More robust schema validation for real model JSON responses
- Multi-agent planning after the single-agent workflow reaches its limits

## Time Spent

Approximately 4 hours.

## Related Documentation

- [API documentation](docs/api.md)
- [Architecture](docs/architecture.md)
- [Pi Agent SDK adapter mapping](docs/pi-agent-adapter-mapping.md)
- [Chinese README](README.md)
