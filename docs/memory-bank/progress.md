# Progress Tracker

## Task Status
- [x] Initial Requirements Analysis from Capstone Deck
- [x] Memory Bank & Requirements Documentation Setup (`docs/requirements/`, `docs/memory-bank/`)
- [x] Step 1: PostgreSQL Data Model (DDL `database/schema.sql` & Seed `database/seed.sql`)
- [x] Step 2: OpenAPI 3.0 Specification (`openapi.yaml`)
- [x] Step 3: Fastify Node.js + TypeScript Backend Implementation
- [x] Step 4: Backend Automated Testing Suite (21 test cases passing)
- [x] Step 5: Angular 17+ Frontend Single Page Application with Standalone Components & Signals
- [x] Step 6: Frontend Automated Component & Service Testing Suite (5 test cases passing)
- [x] Step 7: End-to-End System Validation & Multi-Package Verification
- [x] Step 8: `cataloguePage` Wireframe Implementation (Image 1 from `.bob/tmp/pptx/ppt/media/cataloguePage.png` imported, styled, and tested)
- [x] Step 9: `landing page` Wireframe Implementation (Image 2 from `.bob/tmp/pptx/ppt/media/landing page.png` imported, routed to root `/`, and tested)
- [x] Step 10: `PaymentandPurchase`, `PaymentScreen`, & `Payment&Purchase` Implementation (Images 3-5 from `.bob/tmp/pptx/ppt/media/` imported, styled, and tested)
- [x] Step 11: `Payment&Purchase.png` order-confirm view refinement (`order-confirm.component.ts`): per-item delivery date now bound to `order.estimatedDeliveryDate` with bold date styling as in the wireframe
- [x] Step 12: `PaymentScreen.png` modal refinement (`checkout.component.ts`): flat dark dialog with blue header rule, stacked grey tabs with active accent, underline inputs, empty card fields (placeholders show), Cancel button removed (click backdrop to dismiss), backdrop sits below navbar
- [x] Step 13: `ShoppingCartUpdate.png` (book detail page wireframe) implemented in `book-detail.component.ts`: dark theme, Home/Category/Tag breadcrumb, product block with Add to Cart + Add to Wishlist buttons, language/rating stats, About the writer, Reviews form (0/100 counter, star picker, Submit) with review list, Related Reads sidebar. Wishlist, review submit and writer bio are client-side only (no backend API)
- [x] Step 14: Real PostgreSQL via Podman: `compose.yaml` + `database/Containerfile` (postgres:16-alpine, schema.sql + seed.sql auto-loaded on first start), host port 55432, `backend/.env.example` with `DATABASE_URL`, `.gitignore`, `npm run db:up/db:down/db:reset`. Seed bcrypt hash fixed so `Password123!` works. Verified login, catalogue, cart, checkout, cancel/refund against Postgres; 21/21 backend tests still pass (pg-mem)
- [x] Step 15: Run instructions + dev proxy: `frontend/proxy.conf.json` (`/api` -> `localhost:3000`) wired into `angular.json` serve options (the frontend uses relative `/api` URLs and previously had no proxy). Verified full stack (Postgres 55432 + backend 3000 + frontend 4200) with login through `localhost:4200/api`. README Getting Started rewritten (prereqs, setup, 3-terminal start, DB settings, troubleshooting). `compose.yaml` now has `restart: unless-stopped`, so after a reboot only `podman machine start` is needed (the Podman VM does not auto-start)
- [x] Step 16: Removed the separate Shopping Basket page (`features/cart/cart.component.ts` and the `/cart` route). The wireframe-style Shopping Cart view in `checkout.component.ts` (`/checkout`) is now the only cart screen; the navbar cart icon, footer link and "Buy it again" redirect all go to `/checkout`. Login and Register restyled to the dark theme (`#262626` card on the book-pattern backdrop, underline inputs, blue primary button, blue rule under the header). Frontend build clean, 5/5 tests pass
- [x] Step 17: Wrote `docs/presentation/demo_script.md` (13-section recording script with Say/Do steps, pre-flight checklist, troubleshooting). Honest MVP review: best practices applied vs. known limitations (`npm audit` critical `fast-jwt` via `@fastify/jwt` and high `fastify` 4 — need Fastify 5 / `@fastify/jwt` 10; hardcoded JWT fallback; open CORS, no CSP/rate limit; simulated payments; hardcoded checkout address/tax/coupon so only John can check out; unlocked stock check; wishlist/reviews/author bio client-only; 14 of 20 categories have no books; `$` vs `₹`; no CI/containers for app/E2E tests)
- [x] Step 18: Restyled My Orders (`order-history.component.ts`) to the dark theme (#161616 page, #262626 cards, #393939 headers, square corners, dark status badges, outlined action buttons) and switched its currency from `$` to `₹`. Wrote `docs/presentation/demo-transcript.md` (read-aloud transcript). Frontend build clean, 5/5 tests pass




## Test Results
- **Backend Tests:** 21/21 passing (Auth, Catalogue, Cart, Orders, 48h Cancel, Buy-it-again, Quote)
- **Frontend Tests:** 5/5 passing (AuthService, CartService, ToastService)
- **TypeScript & Angular Compilation:** 100% clean builds with zero errors
