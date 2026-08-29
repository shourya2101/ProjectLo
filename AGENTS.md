# ProjectLo — AI Agent & Developer Guide

Welcome to **ProjectLo**, a peer-to-peer college project & hardware marketplace designed for university students, researchers, and creators to buy/sell digital codebases, rent lab hardware/dev kits, exchange academic research, and communicate directly through an integrated peer-to-peer chat system.

This document serves as the primary system manual and rulebook for AI agents and developers operating within this repository.

---

## 1. Project Overview & Core Mission

- **Project Name**: ProjectLo (`projectlo-monorepo`)
- **Type**: Full-stack Monorepo (Next.js + Express + Prisma + PostgreSQL / Supabase)
- **Primary Value Proposition**:
  - **Digital Codebase Marketplace**: Buy and sell complete capstone projects, algorithms, simulation models, and research codebases.
  - **Hardware & Dev Kit Rentals**: Rent expensive lab equipment, IoT components (ESP32, LoRaWAN), robotics kits, and compute hardware (Nvidia Jetson, Raspberry Pi) on a daily rate with security deposits.
  - **Direct Peer-to-Peer Interaction**: Built-in messaging, direct negotiation, and transactional order completion between buyers, renters, and sellers.

---

## 2. Repository Architecture & Directory Structure

The repository is managed as an npm monorepo with workspace packages located in `apps/*`:

```text
ProjectLo/
├── AGENTS.md                     # Root agent configuration & project manual (this file)
├── package.json                  # Root monorepo workspace configuration
├── .agents/                      # Antigravity agent customizations
│   └── skills/
│       └── projectlo-dev/
│           ├── SKILL.md          # ProjectLo development runbook & operational workflows
│           └── references/       # Detailed schemas, API catalogs, and runbooks
├── apps/
│   ├── api/                      # Backend REST API Service
│   │   ├── package.json          # Express 5.x, Prisma 5.x, TypeScript, TSX, Zod
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Complete PostgreSQL database schema
│   │   │   └── migrations/       # Prisma SQL migration history
│   │   └── src/
│   │       ├── server.ts         # Express server entry point, CORS, and route mounts
│   │       ├── middleware/
│   │       │   └── auth.ts       # Supabase JWT Bearer token authentication middleware
│   │       └── routes/
│   │           ├── products.ts   # Product catalog, search, filtering, and CRUD
│   │           ├── conversations.ts # P2P chat threads & transactional order completion
│   │           └── messages.ts   # Message creation & thread updates
│   │
│   └── web/                      # Frontend Web Application
│       ├── package.json          # Next.js 16 (App Router), React 19, Tailwind CSS v4
│       ├── next.config.ts        # Next.js config with `/api/*` rewrite proxy to port 4000
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       ├── .env.example
│       ├── public/
│       └── src/
│           ├── app/              # Next.js App Router
│           │   ├── layout.tsx    # Root HTML layout with AuthProvider
│           │   ├── globals.css   # Dark theme styles & Tailwind setup
│           │   ├── (auth)/
│           │   │   └── auth/page.tsx # Supabase Email & Google OAuth login/signup
│           │   └── (main)/       # Authenticated/Main layout with Sidebar & Topbar
│           │       ├── layout.tsx
│           │       ├── page.tsx  # Marketplace Discover homepage
│           │       ├── products/ # Product catalog & search (`/products`)
│           │       │   ├── page.tsx
│           │       │   └── [id]/page.tsx # Product details & purchase/rent modal
│           │       ├── sell/page.tsx     # Listing creation & Supabase image upload
│           │       ├── rentals/page.tsx  # Active/past hardware rentals
│           │       ├── my-listings/page.tsx # Manage seller's listings
│           │       ├── messages/page.tsx # P2P messenger & chat window
│           │       └── settings/page.tsx # Profile & notification preferences
│           ├── components/
│           │   ├── chat/
│           │   │   └── ChatModal.tsx     # Direct chat modal for listings
│           │   └── layout/
│           │       ├── DashboardLayout.tsx
│           │       ├── Sidebar.tsx
│           │       └── Topbar.tsx
│           └── lib/
│               ├── auth-context.tsx      # React AuthContext wrapping Supabase client
│               ├── utils.ts              # UI utility functions (cn, clsx)
│               └── supabase/
│                   ├── browser.ts        # Client-side Supabase browser client
│                   ├── server.ts         # Server-side Supabase SSR client
│                   └── middleware.ts     # Supabase session cookie middleware
```

---

## 3. Technology Stack & Key Libraries

### Backend (`apps/api`)
- **Runtime & Language**: Node.js, TypeScript, ES Modules (`"type": "module"`)
- **Server Framework**: Express `v5.2.1` with `tsx` live-reloading
- **Database & ORM**: PostgreSQL via Prisma `v5.22.0` (Supabase connection pooler on port 6543 and direct connection on port 5432)
- **Validation**: Zod `v4.4.3`
- **Security & Headers**: `cors` (credentialed for frontend origin), `cookie-parser`, `dotenv`
- **Auth Verification**: `@supabase/supabase-js` `v2.112.3` verifying Bearer JWTs

### Frontend (`apps/web`)
- **Framework**: Next.js `v16.3.0` (App Router, Turbopack)
- **UI Library**: React `v19.2.8`, Lucide React icons (`v1.30.0`)
- **Styling**: Tailwind CSS `v4` with `@tailwindcss/postcss`, dark slate/indigo theme
- **Authentication**: Supabase SSR (`@supabase/ssr` `v0.12.4`) + `@supabase/supabase-js`
- **Storage**: Supabase Storage bucket (`project-images`) for image uploads

---

## 4. Database Models & Schema Specifications

The database schema is defined in [schema.prisma](file:///e:/Disk%20D/Shourya/Projects/Project/apps/api/prisma/schema.prisma).

### Critical Data Conventions
1. **Currency Handling**: All monetary amounts are stored in **Paise** (integer, where `100 Paise = ₹1.00 INR`) to avoid floating point calculation errors:
   - `priceSalePaise`: Outright purchase price.
   - `priceRentPaise`: Daily rental rate.
   - `securityDepositPaise`: Refundable hardware security deposit.
   - `amountPaise` / `totalPaidPaise`: Transaction totals.
2. **Canonical Conversation Keys**: Conversations between two users for a specific product enforce canonical ordering: `user1Id < user2Id`, with a unique composite constraint `@@unique([user1Id, user2Id, productId])`.

### Key Enums & Models
- `InventoryType`: `DIGITAL` (code, reports, CAD), `PHYSICAL` (dev kits, robots, sensors).
- `ProductType`: `SALE` (buy outright), `RENT` (daily rental), `BOTH` (buy or rent).
- `OrderStatus`: `PENDING`, `COMPLETED`, `CANCELLED`.
- `ConversationStatus`: `ACTIVE`, `COMPLETED`, `CLOSED`.
- `RentalStatus`: `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `DISPUTED`.
- `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`.
- `PaymentProvider`: `RAZORPAY`.

---

## 5. API Reference & Authentication

### Authentication Mechanism
1. Client acquires a JWT access token via Supabase Auth in `apps/web/src/lib/auth-context.tsx`.
2. Frontend requests to the API pass the token in the header:
   ```http
   Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
   ```
3. Backend middleware (`apps/api/src/middleware/auth.ts`) executes `supabase.auth.getUser(token)` and assigns `req.userId = data.user.id`.

### Core API Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Health check status |
| `GET` | `/api/products` | No | List available products (supports `search`, `category`, `type`, `page`, `limit`) |
| `GET` | `/api/products/categories` | No | Grouped categories with active listing counts |
| `GET` | `/api/products/my` | Yes | List products created by the authenticated user |
| `GET` | `/api/products/:id` | No | Get single product detail including seller profile |
| `POST` | `/api/products` | Yes | Create listing (validates pricing rules with Zod) |
| `PUT` | `/api/products/:id` | Yes | Update product (seller only) |
| `DELETE` | `/api/products/:id` | Yes | Soft-deletes (marks `Deleted`) if orders/conversations exist; hard-deletes otherwise |
| `GET` | `/api/conversations` | Yes | Fetch all active/completed conversation threads for user |
| `POST` | `/api/conversations` | Yes | Create or retrieve canonical conversation for a product |
| `GET` | `/api/conversations/:id/messages` | Yes | Fetch messages in a thread with pagination support |
| `POST` | `/api/conversations/:id/complete-order` | Yes | Atomically marks order and conversation as `COMPLETED` |
| `POST` | `/api/messages` | Yes | Send message to active conversation (validates max 2000 chars) |

---

## 6. Development Workflow & Commands

### Running Locally
From the workspace root directory:

```bash
# Run both Backend API and Frontend Web concurrently
npm run dev

# Run only Backend API (Port 4000)
npm run dev:api

# Run only Frontend Web (Port 3000)
npm run dev:web
```

### Prisma & Database Operations (in `apps/api`)
```bash
# Generate Prisma Client
npx prisma generate

# Create and apply a migration
npx prisma migrate dev --name <migration_name>

# Push schema directly to database (prototype mode)
npx prisma db push

# Open visual database studio
npx prisma studio
```

### Environment Variables
- `apps/api/.env`:
  - `PORT=4000`
  - `FRONTEND_URL=http://localhost:3000`
  - `SUPABASE_URL=https://<project-id>.supabase.co`
  - `SUPABASE_ANON_KEY=<anon_key>`
  - `DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true`
  - `DIRECT_URL=postgresql://...:5432/postgres`
- `apps/web/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable_or_anon_key>`

---

## 7. Development Guidelines for Agents

1. **Monorepo Awareness**:
   - Always run commands in the correct working directory (`apps/api` for backend/Prisma, `apps/web` for Next.js/Tailwind).
   - In Next.js, API calls to `/api/*` are automatically proxied to `http://localhost:4000/api/*` via the rewrites in `apps/web/next.config.ts`.
2. **Schema & Monetary Integrity**:
   - Never store float values for currency in the database. Always convert to integer **Paise** on entry (`value * 100`) and divide on presentation (`value / 100`).
3. **P2P Messaging & Order Rules**:
   - Prevent sellers from contacting themselves about their own products.
   - Enforce canonical ordering of conversation participant IDs (`user1Id < user2Id`).
   - Read-only protection: Once a conversation or order is `COMPLETED` or `CLOSED`, reject new messages.
4. **Clean Code & Dark UI Theme**:
   - Use Tailwind CSS v4 classes adhering to the Slate-900 / Indigo-600 dark aesthetic.
   - Maintain accessibility with responsive flex/grid layouts and accessible buttons.
