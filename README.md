# 📚 Cloud E-Bookstore Capstone Platform

An enterprise-grade, full-stack E-Commerce bookstore platform built with **PostgreSQL**, **Fastify (Node.js + TypeScript)**, and **Angular 17+**, featuring automated testing, OpenAPI 3.0 documentation, and an active Memory Bank.

---

## 🌟 Key Features & Capstone User Journeys

1. **User Authentication & Profiles:**
   - Registration & Login with JWT Bearer security
   - Stored multiple delivery addresses (with default designation)
   - Welcome reward points (+100 gift points)
2. **Product Catalogue & Discovery:**
   - Category filtering (Technology, Fiction, Science, Business, History)
   - Brand / Publisher filtering (O'Reilly, Penguin, MIT Press, HarperCollins, Packt, Manning)
   - Dynamic price range and text keyword search
   - **Tentative Delivery Date Tagging** (e.g., *"Get it by Fri, Nov 20 (2 business days)"*)
3. **Product Details & Recommendations:**
   - Full book metadata, stock status, and customer reviews
   - Dynamic **Related Books** & **Personalized History Recommendations**
4. **Shopping Basket / Cart:**
   - Real-time line item modification, quantity limits, and stock checks
   - Free shipping progress tracker ($50 threshold)
5. **Checkout & Multi-Option Payments:**
   - Address selection or inline new address creation
   - Credit Card, Debit Card, and **Loyalty Gift Points Redemption** (1 pt = $0.10 discount)
6. **Order History & Lifecycle:**
   - **"Buy It Again"** 1-click reordering of past order items
   - **48-Hour Order Cancellation** with automatic payment reversal and points refund
   - Comprehensive order status tracking (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Database** | PostgreSQL | DDL schema (`database/schema.sql`), Seed data (`database/seed.sql`), relational constraints & indexes |
| **Backend API** | Fastify (Node.js + TypeScript) | High throughput, modular routes, JSON Schema validation, JWT auth, Swagger UI (`/docs`) |
| **Frontend** | Angular 17+ | Standalone Components, Signals, Reactive Forms, responsive modern UI |
| **Testing** | Vitest | Integration API tests via `@fastify/inject` & Frontend unit tests with happy-dom |
| **API Spec** | OpenAPI 3.0 (`openapi.yaml`) | Complete REST API contracts and request/response models |

---

## 📁 Repository Structure & Memory Bank

```
.
├── docs/
│   ├── memory-bank/                # Project brief, patterns, active context & progress
│   │   ├── projectbrief.md
│   │   ├── systemPatterns.md
│   │   ├── activeContext.md
│   │   └── progress.md
│   ├── presentation/
│   │   ├── demo_script.md          # Demo recording script (Say/Do) + MVP limitations
│   │   └── demo-transcript.md      # Read-aloud transcript for the recording
│   └── requirements/               # Modular requirements specifications
│       ├── 01_functional_requirements.md
│       ├── 02_data_model_and_database.md
│       ├── 03_api_specification.md
│       ├── 04_backend_architecture.md
│       ├── 05_frontend_architecture.md
│       └── 06_testing_strategy.md
├── compose.yaml                    # Podman/Docker Compose: PostgreSQL on host port 55432
├── database/
│   ├── Containerfile               # postgres:16-alpine + schema/seed loaded on first start
│   ├── schema.sql                  # PostgreSQL DDL tables & indexes
│   └── seed.sql                    # Seed books, categories, publishers, demo users & orders
├── backend/
│   ├── src/                        # Fastify TypeScript modules, plugins, and db client
│   ├── test/                       # Vitest integration test suites
│   ├── .env.example                # PORT, JWT_SECRET, DATABASE_URL (copy to .env)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/app/                    # Angular standalone components, services & guards
│   ├── angular.json
│   ├── proxy.conf.json             # dev proxy: /api -> http://localhost:3000
│   ├── package.json
│   └── tsconfig.json
├── openapi.yaml                    # OpenAPI 3.0 Specification
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- Podman (with a running machine: `podman machine start`) **or** Docker

### First-time setup (once)
```bash
npm --prefix backend install
npm --prefix frontend install
cp backend/.env.example backend/.env
```

### Start the whole project (3 terminals, from the repo root)
```bash
# Terminal 1 - PostgreSQL (container on localhost:55432, schema + seed loaded automatically)
npm run db:up

# Terminal 2 - Backend API (http://localhost:3000, Swagger UI at /docs)
npm run start:backend

# Terminal 3 - Frontend (http://localhost:4200, /api is proxied to the backend)
npm run start:frontend
```
Open **http://localhost:4200** and sign in with the demo account below.

### Database
| Setting | Value |
|---|---|
| Host / Port | `localhost` / **55432** (not 5432, so it never clashes with another local Postgres) |
| Database | `ebookstore` |
| User / Password | `ebookstore` / `ebookstore_dev` (override with `POSTGRES_*` env vars) |

- **DBeaver:** New Connection -> PostgreSQL -> enter the values above.
- `npm run db:down` stops the container (data is kept in a volume).
- `npm run db:reset` wipes the volume and reloads `schema.sql` + `seed.sql`.
- Seed scripts run **only on the first start of an empty volume**. After editing them, run `npm run db:reset`.
- If `DATABASE_URL` is empty, the backend falls back to an in-memory `pg-mem` database (this is what the tests use).

### Run Automated Test Suites
```bash
npm run test            # backend (21 tests) + frontend (5 tests)
```

### Demo Login Credentials
- **Email:** `john.doe@example.com`
- **Password:** `Password123!`
- **Points Balance:** 250 Points

### Troubleshooting
- **After a reboot the DB is down:** the container has `restart: unless-stopped`, but the Podman VM itself is not started at login. Run `podman machine start`; the container then comes back by itself. Your data is kept in the `ebookstore-pgdata` volume. (If the container was never created, `npm run db:up` creates it.)
- **`podman compose` fails to connect:** run `podman machine start`.
- **Port 55432 busy:** `POSTGRES_PORT=55433 npm run db:up` and update `DATABASE_URL` in `backend/.env`.
- **Frontend shows no books / 404 on `/api`:** the backend (port 3000) is not running, or `npm start` was not used (the proxy is only active in `ng serve`).
- **Backend ignores Postgres:** check that `backend/.env` exists and contains `DATABASE_URL`.
