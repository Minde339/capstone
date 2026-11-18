# Project Brief: E-Bookstore Capstone Platform

## 1. Project Goal
Build a full-featured, enterprise-grade E-Commerce Bookstore platform with modern engineering practices, clean architecture, comprehensive test coverage, and documentation.

## 2. Technology Stack Selection
- **Database:** PostgreSQL (Relational DB, ACID compliant, schema migrations, seed data)
- **Backend:** Fastify (Node.js + TypeScript), Schema-based validation (TypeBox/Zod), Prisma or PostgreSQL client, OpenAPI / Swagger integration
- **Frontend:** Angular (TypeScript, Standalone Components, Reactive Forms, RxJS / Signals, Responsive Tailwind or CSS Design)
- **Testing:**
  - Backend: Automated REST API integration & unit tests (`vitest` / `node:test` / `tap` / `@fastify/inject`)
  - Frontend: Component & service unit tests with Karma/Jasmine or Vitest/Testing Library
- **Documentation & Memory Bank:** Markdown documentation in `docs/` and `memory-bank/` for full traceability.

## 3. Core Deliverables
1. **Requirements Documentation:** Separate `.md` files covering functional, architectural, data model, API, and testing requirements.
2. **PostgreSQL Database:** Schema definition, migration scripts, sample seed data with diverse book genres, authors, reviews, and test users.
3. **OpenAPI 3.0 Specification:** Complete YAML specification documenting all endpoints, requests, responses, and schemas.
4. **Fastify Backend:** Modular REST API implementing Auth, Catalogue, Cart, Checkout/Payment, Orders, Recommendations, and Gift Points.
5. **Angular Frontend:** Multi-page SPA implementing Landing/Catalogue, Product Details, Basket/Cart, Checkout, Order History, "Buy It Again", and 48-Hour Order Cancellation.
6. **Automated Test Suite:** Comprehensive test suites for backend APIs and frontend components.
