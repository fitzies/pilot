# Pilot

> Your AI Agent Command Centre — a real-time dashboard powered by Convex, built with Next.js 16.

---

## Overview

Pilot is a command centre for managing AI agents orchestrated by **OpenClaw**. OpenClaw communicates with Pilot via authenticated HTTP endpoints to create/update agents, tasks, and activity logs. The frontend renders a real-time dashboard using Convex's reactive queries.

---

## Tech Stack

| Layer    | Tech                                        |
| -------- | ------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4        |
| UI       | shadcn/ui (New York), Radix, Lucide icons   |
| Backend  | Convex (schema, queries, mutations, HTTP)    |
| Auth     | Per-user Bearer tokens (user auth TBD)       |

---

## Project Structure

```
pilot/
├── convex/
│   ├── schema.ts          # Table definitions + indexes
│   ├── queries.ts          # Public read queries (frontend)
│   ├── mutations.ts        # Internal write mutations (API only)
│   ├── auth.ts             # Token lookup (internal query)
│   └── http.ts             # HTTP action routes for OpenClaw
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout (Convex + Theme providers)
│   │   ├── page.tsx        # Dashboard page
│   │   └── globals.css
│   ├── components/
│   │   ├── convex-client-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── taskboard.tsx   # Kanban-style task columns
│   │   ├── team-panel.tsx  # Agent roster sidebar
│   │   ├── scheduled-jobs-panel.tsx # Cron job cards (right sidebar)
│   │   ├── activity-feed.tsx
│   │   ├── status-bar.tsx
│   │   ├── live-indicator.tsx
│   │   └── ui/             # shadcn primitives (do not edit)
│   └── lib/
│       └── utils.ts
├── .env.local              # CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL
├── components.json         # shadcn config
└── package.json
```

---

## Database Schema

Five tables, all scoped to a `users` row:

### `users`
| Field        | Type             | Notes                   |
| ------------ | ---------------- | ----------------------- |
| `externalId` | `string`         | Caller-provided user ID |
| `token`      | `string`         | Bearer token for API    |
| `name`       | `string?`        | Optional display name   |
| `createdAt`  | `number`         | Epoch ms                |

**Indexes:** `by_token`, `by_externalId`

### `agents`
| Field       | Type                              | Notes              |
| ----------- | --------------------------------- | ------------------ |
| `userId`    | `Id<"users">`                     | Owner              |
| `name`      | `string`                          |                    |
| `role`      | `string`                          | e.g. "Research"    |
| `status`    | `"active" \| "idle" \| "offline"` |                    |
| `createdAt` | `number`                          | Epoch ms           |

**Index:** `by_userId`

### `tasks`
| Field         | Type                              | Notes                         |
| ------------- | --------------------------------- | ----------------------------- |
| `userId`      | `Id<"users">`                     | Owner                         |
| `agentId`     | `Id<"agents">?`                   | Assigned agent                |
| `title`       | `string`                          |                               |
| `description` | `string`                          |                               |
| `status`      | `"inbox" \| "active" \| "done"`   | Board column                  |
| `tags`        | `{ label, variant }[]`            | UI badge metadata             |
| `live`        | `boolean`                         | Currently streaming            |
| `createdAt`   | `number`                          | Epoch ms                      |

**Index:** `by_userId`

### `activity`
| Field         | Type              | Notes                |
| ------------- | ----------------- | -------------------- |
| `userId`      | `Id<"users">`     | Owner                |
| `agentId`     | `Id<"agents">?`   | Which agent acted    |
| `taskId`      | `Id<"tasks">?`    | Related task         |
| `action`      | `string`          | e.g. "started"       |
| `description` | `string`          |                      |
| `createdAt`   | `number`          | Epoch ms             |

**Index:** `by_userId`

### `scheduledJobs`
| Field         | Type                        | Notes                          |
| ------------- | --------------------------- | ------------------------------ |
| `userId`      | `Id<"users">`               | Owner                          |
| `agentId`     | `Id<"agents">?`             | Assigned agent                 |
| `name`        | `string`                    |                                |
| `description` | `string`                    |                                |
| `cron`        | `string`                    | Cron expression (e.g. `0 9 * * *`) |
| `status`      | `"active" \| "paused"`      |                                |
| `lastRunAt`   | `number?`                   | Epoch ms of last execution     |
| `nextRunAt`   | `number?`                   | Epoch ms of next execution     |
| `createdAt`   | `number`                    | Epoch ms                       |

**Index:** `by_userId`

---

## API Reference

**Base URL:** `NEXT_PUBLIC_CONVEX_SITE_URL` (e.g. `https://<deployment>.convex.site`)

All endpoints except `POST /api/users` require:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Create User

```
POST /api/users
```

**Body:**
```json
{ "externalId": "user_abc123", "name": "Oliver" }
```

**Response:**
```json
{ "userId": "<convex_id>", "token": "<uuid>" }
```

Save the returned `token` — it authenticates all subsequent requests.

---

### Agents

#### Create Agent
```
POST /api/agents
{ "name": "Nova", "role": "Developer", "status": "active" }
→ { "agentId": "<id>" }
```

#### Update Agent
```
PATCH /api/agents
{ "agentId": "<id>", "status": "offline" }
→ { "success": true }
```

#### Delete Agent
```
DELETE /api/agents
{ "agentId": "<id>" }
→ { "success": true }
```

---

### Tasks

#### Create Task
```
POST /api/tasks
{
  "title": "Design auth flow",
  "description": "Design system authentication",
  "agentId": "<id>",
  "status": "active",
  "tags": [{ "label": "design", "variant": "destructive" }],
  "live": true
}
→ { "taskId": "<id>" }
```

#### Update Task
```
PATCH /api/tasks
{ "taskId": "<id>", "status": "done", "live": false }
→ { "success": true }
```

#### Delete Task
```
DELETE /api/tasks
{ "taskId": "<id>" }
→ { "success": true }
```

---

### Activity

#### Log Activity
```
POST /api/activity
{
  "agentId": "<id>",
  "taskId": "<id>",
  "action": "started",
  "description": "Nova began working on auth flow"
}
→ { "activityId": "<id>" }
```

---

## Frontend Queries

Public Convex queries available for the dashboard (all take `userId`):

| Query                    | Returns                            |
| ------------------------ | ---------------------------------- |
| `queries.getUser`        | Single user document               |
| `queries.getAgents`      | All agents for user                |
| `queries.getTasks`       | All tasks for user                 |
| `queries.getActivity`    | Last 50 activity events (newest first) |

These are reactive — the UI updates in real-time when OpenClaw writes data.

---

## Running Locally

```bash
# Install deps
npm install

# Start Convex dev server (syncs schema + functions)
npx convex dev

# Start Next.js dev server
npm run dev
```

The app runs at `http://localhost:3000`. Convex dashboard at `https://dashboard.convex.dev`.

---

## Architecture Flow

```
┌─────────────┐     Bearer token      ┌──────────────────┐
│   OpenClaw   │ ───────────────────→  │  convex/http.ts   │
│  (external)  │   POST/PATCH/DELETE   │  HTTP Actions     │
└─────────────┘                        └────────┬─────────┘
                                                │
                                    ctx.runMutation(internal.*)
                                                │
                                       ┌────────▼─────────┐
                                       │ convex/mutations  │
                                       │ (internal only)   │
                                       └────────┬─────────┘
                                                │
                                           writes to DB
                                                │
                                       ┌────────▼─────────┐
                                       │  Convex Database  │
                                       │  users · agents   │
                                       │  tasks · activity │
                                       │  scheduledJobs    │
                                       └────────┬─────────┘
                                                │
                                        reactive queries
                                                │
                                       ┌────────▼─────────┐
                                       │  Next.js Frontend │
                                       │  useQuery(...)    │
                                       │  real-time UI     │
                                       └──────────────────┘
```

---

## What's Next

- [ ] User authentication (Clerk) on the frontend
- [ ] Wire components to live Convex queries (replace hardcoded data)
- [ ] Agent status websocket / live indicator integration
- [ ] Role-based access control on HTTP endpoints
