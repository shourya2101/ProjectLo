---
name: projectlo-dev
description: >-
  Comprehensive guide, operational workflows, database procedures, and architecture reference for the ProjectLo college project and hardware marketplace. Use when building, modifying, or debugging ProjectLo frontend (Next.js), backend (Express), database migrations (Prisma/PostgreSQL), authentication (Supabase), or peer-to-peer messaging.
---

# ProjectLo Developer & Agent Skill

This skill provides step-by-step procedures, runbooks, and reference manuals for developing, testing, and modifying the **ProjectLo** marketplace codebase.

---

## 1. Quick Architecture Map

ProjectLo is an npm monorepo with two primary applications:

```text
ProjectLo Monorepo
├── apps/api (Port 4000) ── Express 5 + Prisma 5 + PostgreSQL (Supabase) + Zod
└── apps/web (Port 3000) ── Next.js 16 (App Router) + React 19 + Tailwind v4 + Supabase SSR
```

All client-side API calls to `/api/*` in the frontend are proxied directly to the backend (`http://localhost:4000/api/*`) via Next.js rewrites in [next.config.ts](file:///e:/Disk%20D/Shourya/Projects/Project/apps/web/next.config.ts).

---

## 2. Common Development Workflows & Runbooks

### Workflow A: Running the Application Locally
1. Start both backend and frontend concurrently from the workspace root:
   ```bash
   npm run dev
   ```
2. Alternatively, run individual services:
   - Backend API: `npm run dev:api` (or `cd apps/api && npm run dev`)
   - Frontend Web: `npm run dev:web` (or `cd apps/web && npm run dev`)
3. Verify health status by checking:
   - `http://localhost:4000/api/health` -> `{"status": "ok"}`
   - `http://localhost:3000/` -> Discover Homepage

---

### Workflow B: Database Schema Modifications & Migrations
When modifying database models:
1. Open [schema.prisma](file:///e:/Disk%20D/Shourya/Projects/Project/apps/api/prisma/schema.prisma).
2. Apply changes adhering to data conventions (always store currency in **Paise** as integers).
3. In `apps/api/`, create and execute a migration:
   ```bash
   cd apps/api
   npx prisma migrate dev --name <descriptive_name>
   ```
4. Regenerate the Prisma Client if needed:
   ```bash
   npx prisma generate
   ```
5. Consult the complete database documentation in [schema.md](./references/schema.md).

---

### Workflow C: Adding a New Backend API Endpoint
1. Define request validation with **Zod** in the appropriate route file (`apps/api/src/routes/`).
2. Implement route handler using `prisma.<model>` queries inside try/catch blocks.
3. Protect private routes by applying the `authenticate` middleware from [auth.ts](file:///e:/Disk%20D/Shourya/Projects/Project/apps/api/src/middleware/auth.ts).
4. Access the authenticated user ID via `req.userId`.
5. Mount new router in [server.ts](file:///e:/Disk%20D/Shourya/Projects/Project/apps/api/src/server.ts) if creating a new route file.
6. Consult the full API catalog in [api_reference.md](./references/api_reference.md).

---

### Workflow D: Adding a New Frontend Page or Feature
1. Create a page inside `apps/web/src/app/(main)/<route-name>/page.tsx` for protected/dashboard views or `apps/web/src/app/(auth)/` for auth views.
2. Use the `useAuth()` hook from [auth-context.tsx](file:///e:/Disk%20D/Shourya/Projects/Project/apps/web/src/lib/auth-context.tsx) for accessing user session and JWT tokens.
3. Make API calls passing `Authorization: Bearer ${session.access_token}` when calling authenticated endpoints.
4. Follow the Dark Slate theme styling using Tailwind CSS classes (`bg-[#090d16]`, `bg-slate-900`, `text-slate-100`, `border-slate-800`, `text-indigo-400`, `btn-anim`).

---

### Workflow E: Managing Peer-to-Peer Chat & Orders
1. **Conversation Creation**:
   - `POST /api/conversations` with `{ productId }`.
   - Backend enforces canonical ordering: `user1Id < user2Id`.
   - Prevent sellers from contacting themselves.
2. **Messaging**:
   - `POST /api/messages` with `{ conversationId, content }`.
   - Character limit: Max 2000 chars.
   - Reject messages if conversation is `COMPLETED` or `CLOSED`.
3. **Order Completion**:
   - `POST /api/conversations/:id/complete-order` executes a database transaction updating both `Order.status` and `Conversation.status` to `COMPLETED`.

---

### Workflow F: Immediate Git Commit & Push Policy (MANDATORY)
1. After every completed file change, bug fix, feature, or refactor:
   ```bash
   git add . ; git commit -m "descriptive commit message" ; git push
   ```
2. Never leave uncommitted files or unpushed local commits after finishing a task. All changes must be live on GitHub remote immediately.

---

## 3. Reference Documentation

For detailed technical references, refer to the following documents:
- [Database Schema & Models Reference](./references/schema.md)
- [REST API Endpoints & Contract Reference](./references/api_reference.md)
- [Architecture & Frontend Patterns](./references/workflows.md)
