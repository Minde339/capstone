# Active Context

## Current Goal
Proceeding through the Capstone workflow step-by-step:
1. Requirements & Memory Bank Documentation established.
2. Step 1: PostgreSQL Data Model, Schema, and Seed scripts.
3. Step 2: OpenAPI 3.0 specification (`openapi.yaml`).
4. Step 3: Fastify Node.js Backend API implementation.
5. Step 4: Backend API & Unit test suite.
6. Step 5: Angular Frontend Application.
7. Step 6: Frontend Tests.
8. Step 7: System Verification and Run.

## Current State (Nov 2026)
- Steps 1-7 done; wireframes (catalogue, landing, payment screen, purchase confirmation, book detail) implemented in Angular. Cart is a single view at `/checkout` (no separate basket page); login/register use the same dark theme.
- Real PostgreSQL runs in Podman via `compose.yaml` (host port 55432). The backend selects it through `DATABASE_URL` in `backend/.env`; if empty it falls back to in-memory pg-mem (used by tests).
- Start commands: `npm run db:up`, `npm run start:backend`, `npm run start:frontend` (see README).
- Next: more seed books/covers per category, backend endpoints for wishlist/reviews/author bios, Containerfiles + OpenShift manifests, git init + feature branch + PR.

## Active References
- Requirements: `docs/requirements/`
- Tech Stack: PostgreSQL + Fastify (TypeScript) + Angular + Testing Suites
