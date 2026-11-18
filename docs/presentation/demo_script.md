# Demo Script & Transcript: Book Worm E-Bookstore (Capstone)

Target length: **8-10 minutes**. Read the *"Say"* parts aloud; the *"Do"* parts are what to click.

---

## 0. Before you hit record (pre-flight checklist)

```bash
podman machine start                 # only if the Podman VM is not running
npm run db:up                        # PostgreSQL on localhost:55432
npm run db:reset                     # clean seed data: 11 books, 2 users, 2 demo orders
npm run start:backend                # terminal 2 -> http://localhost:3000
npm run start:frontend               # terminal 3 -> http://localhost:4200
```

Have these windows ready, in this order:
1. Browser tab 1: `http://localhost:4200` (signed out, clear localStorage if needed)
2. Browser tab 2: `http://localhost:3000/docs` (Swagger UI)
3. DBeaver connected to `localhost:55432 / ebookstore` with tables `books`, `orders`, `payments` open
4. Terminal at the repo root (for the test run)
5. Slide deck / wireframes for the side-by-side comparison

Demo account: **john.doe@example.com / Password123!** (250 gift points).

> **Use John Doe for the whole demo.** Checkout currently uses a hardcoded seeded address (`addr-1`) that belongs only to John, so Alice or a freshly registered user can add to the cart but cannot place an order.

---

## 1. Introduction (about 40 s)

**Say:**
> "Hi, this is my Applied AI Specialist capstone: a cloud-ready e-commerce bookstore called Book Worm. It is built with **PostgreSQL**, a **Fastify Node.js/TypeScript** backend and an **Angular 17** frontend. I built it with **IBM Bob**, starting from the wireframes in the capstone deck: first the data model, then the OpenAPI specification, the backend services, the UI and the tests. A memory bank in the `docs` folder keeps the requirements and progress so the AI work stays consistent."

**Do:** Show the repo tree briefly (`docs/memory-bank`, `database`, `backend`, `frontend`, `openapi.yaml`, `compose.yaml`).

---

## 2. Database (about 60 s)

**Do:** Switch to DBeaver and open `books`, then `categories`.

**Say:**
> "The database is real PostgreSQL running in a **Podman container** from a compose file, on port 55432. The schema and seed scripts load automatically on first start, so anyone can reproduce this with one command: `npm run db:up`. We have users, addresses, categories, publishers, books, reviews, carts, orders, order items and payments. The nine books from the wireframe are seeded with their categories, formats and prices."

**Do:** Run `select title, price, format, section from books;`

---

## 3. API contract (about 45 s)

**Do:** Switch to Swagger UI at `/docs`. Expand *Authentication* and *Checkout & Orders*.

**Say:**
> "The API is documented with OpenAPI 3. Endpoints cover authentication, the catalogue, related books and recommendations, the cart, checkout quote, placing orders, cancelling within 48 hours and 'buy it again'. Protected endpoints require a JWT bearer token, and request bodies are validated with JSON schemas."

**Optional:** Run `GET /api/books` from Swagger to show live data from PostgreSQL.

---

## 4. Catalogue and discovery (about 70 s)

**Do:** Open `http://localhost:4200`.

**Say:**
> "This is the landing and catalogue page, built from the wireframe: a dark theme, category sidebar, and the three sections Recommended for You, Bestsellers and New Launches. Each card shows the cover, author, description, format, tags, price and a tentative delivery date."

**Do:**
- Type `focus` in the search box, then clear it.
- Change the *Sort by* dropdown.
- Click a category in the sidebar. **Pick Self-help or Mystery.** Some other categories have no books yet and would look empty.

> Avoid clicking **My Wishlist** and **My Writers** in the top bar. They only open the catalogue for now (see "Known limitations").

---

## 5. Product details (about 60 s)

**Do:** Click **Joy of Minimalism**.

**Say:**
> "The product page shows the book details, price, delivery date, language and rating, an about-the-writer section, a review form with a character counter and star rating, and **Related Reads** on the right, which come from the API based on category."

**Do:** Click **Add to Cart**. You will be redirected to the sign-in page because you are not logged in.

---

## 6. Authentication (about 40 s)

**Say:**
> "Carts are tied to a user, so the app asks me to sign in. The login page follows the same dark design. Passwords are hashed with bcrypt and the session uses a JWT."

**Do:** Click **John Doe (250 pts)**, then **Sign In**. Go back to *Joy of Minimalism* and click **Add to Cart**. Add **The Path to Success** as well. The navbar badge shows 2.

---

## 7. Shopping cart (about 70 s)

**Do:** Click the cart icon.

**Say:**
> "This is the shopping cart screen from the wireframe: the books in my cart with quantity controls, the delivery address, and the grand total with price, tax, delivery and a coupon."

**Do:** Press `+` on one item, then `-` back. Point out the saved-address form.

> **Be upfront here (MVP):** the address form, the tax figure and the coupon are demo values on the screen, and the order is placed with the seeded address. A production version would load saved addresses from the API and calculate tax and discounts on the server.

---

## 8. Payment and purchase confirmation (about 70 s)

**Do:** Click **Pay Now**.

**Say:**
> "The payment screen opens as in the wireframe: Credit Card, Debit card, UPI and Wallet tabs, with the payable amount at the top."

**Do:** Click through the four tabs. On *Credit Card*, enter `4242 4242 4242 1111`, name `John Doe`, CVV `123`, expiry `12/2030`. Click **Pay Now**.

**Say:**
> "The backend places the order in a **database transaction**: it creates the order and items, reduces stock, updates gift points, records the payment and empties the cart. If anything fails, everything rolls back."

**Do:** The confirmation page appears ("Your purchase of the following reads is successful"). Point out the delivery dates, then click **Continue your Shopping**.

> Payment is **simulated**: there is no real payment gateway, so any card is accepted and only the last four digits are stored. Say this out loud.

---

## 9. Orders, buy-it-again and 48-hour cancellation (about 80 s)

**Do:** Click **My Orders**.

**Say:**
> "Order history lists past orders with their status. 'Buy it again' puts the items back into the cart. Orders that are still `PLACED` or `PROCESSING` can be cancelled within 48 hours, which refunds the payment, restores stock and returns any redeemed gift points."

**Do:** Click **Cancel** on the newest order and confirm. The status changes to `CANCELLED`.

---

## 10. Verify in the database (about 40 s)

**Do:** In DBeaver run:
```sql
select o.order_number, o.status, p.status as payment_status, p.card_last4
from orders o join payments p on p.order_id = o.id
order by o.created_at desc limit 3;
```

**Say:**
> "The order shows `CANCELLED` and its payment is `REFUNDED`, with only the last four card digits stored. The UI, API and database agree."

---

## 11. Automated tests (about 40 s)

**Do:** In the terminal run `npm run test`.

**Say:**
> "There are 21 backend integration tests covering authentication, catalogue, cart, orders, the 48-hour cancellation rule, buy-it-again and the quote, plus 5 frontend service tests. The backend tests run against an in-memory PostgreSQL emulator, so they are fast and need no setup."

---

## 12. Wrap-up (about 50 s)

**Say:**
> "To summarise: wireframes to data model, OpenAPI contract, Fastify services, an Angular UI matching the wireframes, a containerised PostgreSQL, automated tests and a memory bank documenting every step. The project is organised so it can move to GitHub and then deploy to OpenShift. This is an **MVP**: the core journeys work end to end, and I have a clear list of what to harden before production, which I'll cover next."

---

## 13. MVP status: what is applied and what is not

Say this part honestly. It shows you know what "production-ready" would need.

### Best practices already applied
| Area | What is in place |
|---|---|
| Architecture | Modular layers: routes, services, DB abstraction; Angular standalone components, signals and lazy-loaded routes |
| API design | OpenAPI 3 spec and Swagger UI; JSON-schema validation on request bodies; consistent HTTP status codes |
| Security basics | bcrypt password hashing; JWT on protected routes; users can only read and cancel their own orders; Helmet headers; parameterised SQL (no string-built queries); only the last 4 card digits stored |
| Data integrity | Foreign keys, unique constraints and check constraints; order placement and cancellation run inside transactions |
| Config & secrets | Environment variables (`PORT`, `JWT_SECRET`, `DATABASE_URL`); `.env` git-ignored, `.env.example` provided |
| Operations | `/health` endpoint; containerised DB with health check and restart policy; one-command setup |
| Quality | 21 backend integration tests, 5 frontend tests; clean TypeScript build; memory bank and README kept up to date |

### Known limitations (MVP scope)
| Area | Limitation | Production fix |
|---|---|---|
| Secrets | `JWT_SECRET` falls back to a hardcoded default if the variable is missing | Fail on startup if not set; use OpenShift Secrets |
| Dependencies | `npm audit` reports vulnerabilities in the backend, including a **critical** one in `fast-jwt` (via `@fastify/jwt`) and a high one in `fastify` 4. Fixes need major upgrades (Fastify 5, `@fastify/jwt` 10) | Upgrade and re-run tests |
| Web hardening | CORS allows any origin; CSP is disabled; no rate limiting on login; minimum password length is only 6 | Restrict origins, enable CSP, add `@fastify/rate-limit`, stronger password rules |
| Payments | Simulated only; card details are not validated and no gateway is integrated | Integrate a PCI-compliant provider (card data should never touch our server) |
| Checkout screen | Address form, tax (₹62) and coupon (₹100) are demo values; the order uses the seeded address; the screen total can differ from the backend total | Load addresses from the API; calculate tax and discounts on the server only |
| Concurrency | Stock is checked before the transaction starts and not locked, so two simultaneous buyers could oversell the last copy | Check and decrement stock inside the transaction (`SELECT … FOR UPDATE` or a conditional `UPDATE`) |
| Error handling | Some internal error messages are sent to the client | Map errors to safe, typed responses |
| Unfinished features | Wishlist, "My Writers", review submission and author bios are front-end only; 14 of 20 sidebar categories have no books | Add API endpoints, tables and more seed data |
| Session | JWT stored in `localStorage` | HttpOnly cookies or short-lived tokens with refresh |
| Testing | No frontend component tests and no end-to-end tests | Add component tests and Playwright E2E |
| Delivery | No CI pipeline, no DB migration tool, no Containerfiles for the backend and frontend yet, not yet in Git | Add GitHub Actions, a migration tool, OpenShift manifests, git branch and PR |

**Closing line:**
> "So the MVP delivers every journey in the capstone brief, and the list above is my hardening backlog. The next steps are the dependency upgrades, moving checkout calculations to the server, then containers, CI and the OpenShift deployment."

---

## Appendix: if something goes wrong during recording

| Symptom | Fix |
|---|---|
| No books on the page | Backend not running, or DB container is down: `podman machine start`, then `npm run db:up` |
| Login fails | Run `npm run db:reset`; seed users use `Password123!` |
| Cart icon sends you to the login page | You are signed out. Sign in again |
| Order history already has a cancelled order | Run `npm run db:reset` before recording for a clean state |
| Port 4200 or 3000 already in use | `lsof -nP -iTCP:4200 -sTCP:LISTEN` and stop the old process |
