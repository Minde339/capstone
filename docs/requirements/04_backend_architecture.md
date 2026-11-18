# Backend Architecture: Fastify + Node.js + TypeScript

## 1. Architectural Principles
- **Framework:** Fastify v4 / v5 (High performance, low overhead, schema validation plugin architecture).
- **Language:** TypeScript with strict type checking.
- **Database Layer:** PostgreSQL client (`pg` pool or Prisma ORM) with parameterized queries to prevent SQL injection and transaction support for multi-step checkout.
- **Validation:** JSON Schema validation on routes via `@fastify/type-provider` or Zod / TypeBox.
- **Authentication:** `@fastify/jwt` with `bcryptjs` password hashing.
- **Documentation:** `@fastify/swagger` and `@fastify/swagger-ui` serving the live interactive OpenAPI UI at `/docs`.
- **CORS & Security:** `@fastify/cors`, `@fastify/helmet`, secure HTTP headers.

---

## 2. Directory Structure
```
backend/
├── src/
│   ├── config/             # Environment variables & constants
│   ├── plugins/            # Fastify plugins (JWT, DB Pool, Swagger, CORS, Error Handler)
│   ├── modules/
│   │   ├── auth/           # Routes, Service, Controller, Schema
│   │   ├── books/          # Catalogue, search, filtering, recommendations
│   │   ├── cart/           # Cart management, item calculation
│   │   ├── orders/         # Checkout, payment processing, 48h cancel, buy-in-again
│   │   └── user/           # User address & profile management
│   ├── db/
│   │   ├── index.ts        # Database connection pool / client
│   │   ├── schema.sql      # DDL table creation scripts
│   │   └── seed.sql        # Rich seed data (categories, books, users, orders)
│   ├── app.ts              # Fastify instance builder & plugin registration
│   └── server.ts           # Entry point listener
├── test/
│   ├── auth.test.ts
│   ├── books.test.ts
│   ├── cart.test.ts
│   └── orders.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```
