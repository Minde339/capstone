# Testing Strategy: Backend & Frontend

## 1. Backend Testing Strategy
- **Framework:** Vitest with Fastify's native `.inject()` testing API.
- **Coverage Areas:**
  1. **Authentication Tests:**
     - User registration with duplicate email validation.
     - Login with valid and invalid credentials.
     - Protected endpoint access with/without JWT token.
  2. **Catalogue & Search Tests:**
     - Querying all books, filtering by category, brand/publisher, and price range.
     - Text search matching title and author.
     - Single book lookup with related recommendations.
  3. **Cart Operations:**
     - Add to cart, update quantity, remove item, clear cart.
     - Stock limit validation.
  4. **Orders & Checkout Tests:**
     - Quote calculation with and without gift points discount.
     - Order placement, address association, payment creation.
     - 48-Hour cancellation window enforcement (cancel successful when within 48h, refund of points).
     - "Buy It Again" re-ordering of previous order items.

---

## 2. Frontend Testing Strategy
- **Framework:** Angular Testbed / Jasmine / Vitest component tests.
- **Coverage Areas:**
  - `AuthService` and `CartService` state transitions.
  - `CatalogueComponent` search and category filtering interaction.
  - `CartComponent` item quantity updates and total calculation.
  - `CheckoutComponent` validation and payment option toggle.
  - `OrderHistoryComponent` status display and 48-hour cancel button logic.
