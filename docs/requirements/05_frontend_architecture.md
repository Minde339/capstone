# Frontend Architecture: Angular SPA

## 1. Architectural Principles
- **Framework:** Angular 17+ (Standalone Components, Signals, modern control flow `@if`, `@for`).
- **Styling:** Responsive, modern UI design (CSS / Tailwind design tokens) supporting mobile, tablet, and desktop views.
- **State Management:** Reactive services with Angular Signals and RxJS observables for auth state, cart state, notification toasts, and filters.
- **Routing:** Lazy-loaded standalone routes with functional guards (`authGuard`).
- **HTTP Layer:** `HttpClient` with an `AuthInterceptor` attaching the JWT token and central error handling.

---

## 2. Page & Component Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/          # AuthGuard
│   │   │   ├── interceptors/    # AuthInterceptor, ErrorInterceptor
│   │   │   ├── models/          # TypeScript interfaces (Book, User, Cart, Order, Address)
│   │   │   └── services/        # AuthService, BookService, CartService, OrderService, ToastService
│   │   ├── features/
│   │   │   ├── auth/            # Login, Register components
│   │   │   ├── catalogue/       # Book list, Category/Brand filters, Search, Book card
│   │   │   ├── book-detail/     # Book details, Related items, Delivery estimation, Reviews
│   │   │   ├── cart/            # Basket drawer / full page, quantity modifier
│   │   │   ├── checkout/        # Address selector/form, Payment methods, Gift points redemption
│   │   │   ├── order-history/   # Past orders, Status badge, "Buy It Again", 48h Cancel action
│   │   │   └── order-confirm/   # Purchase success page with receipt & tracking date
│   │   ├── shared/
│   │   │   └── components/      # Navbar, Footer, StarRating, Modal, Toast
│   │   ├── app.routes.ts        # Route declarations
│   │   ├── app.config.ts        # Application providers (HttpClient, Router)
│   │   └── app.component.ts     # Root shell
│   ├── index.html
│   ├── styles.css
│   └── main.ts
```
