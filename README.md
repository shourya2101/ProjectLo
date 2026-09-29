# ProjectLo

**ProjectLo** is a peer-to-peer college project & hardware marketplace designed for university students, researchers, and creators. It allows users to buy/sell digital codebases, rent lab hardware/dev kits, exchange academic research, and communicate directly through an integrated peer-to-peer chat system.

🌍 **Live Website (Vercel):** [https://project-loo.vercel.app/](https://project-loo.vercel.app/)

---

## 🚀 Features

- **Digital Codebase Marketplace:** Buy and sell complete capstone projects, algorithms, simulation models, and research codebases.
- **Hardware & Dev Kit Rentals:** Rent expensive lab equipment, IoT components (ESP32, LoRaWAN), robotics kits, and compute hardware (Nvidia Jetson, Raspberry Pi) on a daily rate with security deposits.
- **Direct Peer-to-Peer Interaction:** Built-in messaging, direct negotiation, and transactional order completion between buyers, renters, and sellers.
- **Secure Authentication:** Supabase JWT Bearer token authentication & Google OAuth.

## 🛠️ Technology Stack

This project is a full-stack monorepo managed via npm workspaces.

### Frontend (`apps/web`)
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide React icons
- **Authentication & Storage:** Supabase SSR, Supabase Storage for image uploads

### Backend (`apps/api`)
- **Server:** Node.js, Express v5.2.1, TypeScript (ES Modules)
- **Database & ORM:** PostgreSQL, Prisma v5.22.0
- **Validation:** Zod

## 📂 Repository Structure

```text
ProjectLo/
├── apps/
│   ├── api/                      # Backend REST API Service
│   │   ├── prisma/               # PostgreSQL database schema & migrations
│   │   └── src/                  # Express server, middleware, routes
│   └── web/                      # Frontend Web Application (Next.js)
│       └── src/
│           ├── app/              # Next.js App Router layout & pages
│           ├── components/       # Shared UI components
│           └── lib/              # Auth context & Supabase clients
```

## ⚙️ Development Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database (via Supabase or local)
- NPM or PNPM

### 2. Environment Variables

Create `.env` files in both the frontend and backend directories.

**Backend (`apps/api/.env`)**
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres
```

**Frontend (`apps/web/.env.local`)**
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 5. Running Locally
From the workspace root directory:

```bash
# Run both Backend API and Frontend Web concurrently
npm run dev

# Run only Backend API (Port 4000)
npm run dev:api

# Run only Frontend Web (Port 3000)
npm run dev:web
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:4000`. API calls from the frontend to `/api/*` are automatically proxied to port 4000.

## 👥 Contributors

- **Shourya Pratap** ([@shourya2101](https://github.com/shourya2101))
- **ZeroTrace7** ([@ZeroTrace7](https://github.com/ZeroTrace7))

## 📄 License

This project is licensed under the MIT License.
