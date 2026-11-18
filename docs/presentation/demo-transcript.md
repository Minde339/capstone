# Demo Transcript: Book Worm E-Bookstore

Spoken text for the recording, about 8-10 minutes. Text in *[italics]* is an on-screen action, not something to say aloud. For the full checklist and troubleshooting, see [`demo_script.md`](demo_script.md).

Demo account: `john.doe@example.com` / `Password123!`. Use John for the whole demo, because checkout currently uses his seeded address.

---

## 1. Introduction

Hi, this is my Applied AI Specialist capstone: a cloud-ready e-commerce bookstore called Book Worm.

It is built with PostgreSQL, a Fastify Node.js and TypeScript backend, and an Angular 17 frontend. I built it with IBM Bob, starting from the wireframes in the capstone deck. First the data model, then the OpenAPI specification, the backend services, the user interface and the tests.

A memory bank in the docs folder keeps the requirements, the architecture patterns and a step-by-step progress log, so the AI-assisted work stays consistent from one session to the next.

*[Show the repo tree: docs/memory-bank, database, backend, frontend, compose.yaml.]*

## 2. Database

*[Switch to DBeaver, open the books table.]*

The database is real PostgreSQL 16, running in a Podman container from a compose file on port 55432. The schema and seed scripts load automatically the first time the container starts, so anyone can reproduce this setup with one command, `npm run db:up`.

There are tables for users, addresses, categories, publishers, books, reviews, carts, orders, order items and payments. The nine books from the wireframes are seeded with their categories, formats and prices, plus two extra technology titles.

## 3. API contract

*[Switch to Swagger UI at localhost:3000/docs.]*

The API is documented with OpenAPI 3. It covers authentication, the catalogue, related books and recommendations, the cart, the checkout quote, placing orders, cancelling within 48 hours, and "buy it again".

Protected endpoints need a JWT bearer token, and request bodies are validated with JSON schemas.

*[Run GET /api/books.]*

This is live data coming straight from PostgreSQL.

## 4. Catalogue and discovery

*[Open localhost:4200.]*

This is the landing and catalogue page, built from the wireframe. It has a dark theme, a category sidebar, and three sections: Recommended for You, Bestsellers and New Launches. Each card shows the cover, author, description, format, tags, price and a tentative delivery date.

*[Type "focus" in the search box, clear it, change Sort by, click Self-help.]*

Search, sorting and category filtering all go through the API.

## 5. Product details

*[Click Joy of Minimalism.]*

The product page follows the wireframe. It shows the book details, price, delivery date, language and rating, an about-the-writer section, a review form with a character counter and star rating, and Related Reads on the right, which the API selects by category.

*[Click Add to Cart. The sign-in page opens.]*

Carts belong to a user, so the app asks me to sign in first.

## 6. Authentication

The login page uses the same dark design. Passwords are hashed with bcrypt, and the session uses a JWT.

*[Click the John Doe demo button, then Sign In. Go back to Joy of Minimalism and click Add to Cart. Add The Path to Success too.]*

The cart badge in the navbar now shows two items.

## 7. Shopping cart

*[Click the cart icon.]*

This is the shopping cart screen from the wireframe: the books in my cart with quantity controls, the delivery address, and the grand total with price, tax, delivery and a coupon.

*[Press plus on one item, then minus.]*

To be upfront, this is an MVP. The address form, the tax figure and the coupon are demo values on this screen, and the order is placed with the seeded address. In production I would load saved addresses from the API and calculate tax and discounts on the server.

## 8. Payment and purchase confirmation

*[Click Pay Now.]*

The payment screen opens as in the wireframe, with Credit Card, Debit Card, UPI and Wallet tabs and the payable amount at the top.

*[Click through the tabs. On Credit Card enter 4242 4242 4242 1111, name John Doe, CVV 123, expiry 12/2030. Click Pay Now.]*

The backend places the order in a database transaction. It creates the order and its items, reduces stock, updates gift points, records the payment and empties the cart. If any step fails, everything rolls back.

*[The confirmation page appears.]*

This is the purchase confirmation from the wireframe, with the delivery date for each book.

I want to be clear that payment is simulated. There is no real payment gateway, any card is accepted, and only the last four digits are stored.

*[Click Continue your Shopping.]*

## 9. Orders, buy it again and cancellation

*[Click My Orders.]*

Order history now uses the same dark theme as the rest of the app. It lists past orders with their status, items and delivery information. "Buy it again" puts the items back in the cart.

Orders that are still Placed or Processing can be cancelled within 48 hours. Cancelling refunds the payment, restores stock and returns any redeemed gift points.

*[Click Cancel on the newest order and confirm. The status changes to Cancelled.]*

## 10. Verifying in the database

*[In DBeaver run: select o.order_number, o.status, p.status as payment_status, p.card_last4 from orders o join payments p on p.order_id = o.id order by o.created_at desc limit 3;]*

The order shows Cancelled and its payment shows Refunded, with only the last four card digits stored. The interface, the API and the database all agree.

## 11. Automated tests

*[In the terminal run: npm run test.]*

There are 21 backend integration tests covering authentication, the catalogue, the cart, orders, the 48-hour cancellation rule, buy it again and the quote. There are also 5 frontend service tests.

The backend tests run against an in-memory PostgreSQL emulator, so they are fast and need no setup.

## 12. Wrap-up

To summarise: wireframes to a data model, an OpenAPI contract, Fastify services, an Angular interface matching the wireframes, a containerised PostgreSQL, automated tests, and a memory bank that documents every step.

## 13. MVP status

This is an MVP. The core journeys work end to end, and I have a clear backlog to harden before production.

What is already in place: a modular architecture, a documented and validated API, bcrypt and JWT security, parameterised SQL, security headers, transactions for orders and cancellations, environment-based configuration, and automated tests.

What is not done yet:

- **Dependency vulnerabilities.** `npm audit` reports a critical issue in the JWT library chain and a high one in Fastify 4. Fixing them means upgrading to Fastify 5 and a newer `@fastify/jwt`.
- **Web hardening.** CORS is open, there is no content security policy or rate limiting, the minimum password length is only six characters, and the JWT secret has a development fallback.
- **Checkout.** Address, tax and coupon are demo values, and the screen total can differ from the backend total.
- **Concurrency.** Stock is checked before the transaction rather than locked inside it, so two simultaneous buyers could oversell the last copy.
- **Unfinished features.** Wishlist, My Writers, review submission and author bios exist only in the frontend, and 14 of the 20 sidebar categories have no books yet.
- **Delivery.** There is no CI pipeline yet, no Containerfiles for the backend and frontend, no end-to-end tests, and the project is not yet in Git.

So the MVP delivers every journey in the capstone brief, and that list is my hardening backlog. The next steps are the dependency upgrades, moving the checkout calculations to the server, and then containers, CI and the OpenShift deployment.

Thank you for watching.
