# Functional Requirements: E-Bookstore Platform

## 1. User Journeys Overview

The application satisfies the key customer journeys specified in the Capstone requirements:
1. **Authentication & User Management**
2. **Product Catalogue & Search / Filtering**
3. **Product Details & Recommendations**
4. **Shopping Cart / Basket Management**
5. **Checkout & Multi-Option Payment**
6. **Order History, "Buy It Again", and 48-Hour Order Cancellation**
7. **Gift Points & Loyalty Program**

---

## 2. Detailed Journey Requirements

### Journey 1: Authentication & User Management
- **FR-AUTH-1:** User registration with email, full name, password, and phone number.
- **FR-AUTH-2:** User login with JWT token issuance and persistent session handling.
- **FR-AUTH-3:** User profile management including stored multiple delivery addresses (default tag, street, city, postal code, country).
- **FR-AUTH-4:** Loyalty gift point balance initialized on signup (e.g., 100 bonus welcome points).

### Journey 2: Catalogue & Product Discovery
- **FR-CAT-1 (Categories):** Display and filter by categories (Fiction, Non-Fiction, Tech & Engineering, Science, History, Arts, Young Adult).
- **FR-CAT-2 (Brands / Publishers):** Browse and filter books by publisher/brand (e.g., O'Reilly, Penguin Random House, HarperCollins, Packt, MIT Press).
- **FR-CAT-3 (Search & Filter):** Free-text search by title, author, ISBN, or description. Filter by price range, rating, category, and publisher.
- **FR-CAT-4 (Sorting):** Sort by price (low to high, high to low), average customer rating, publication date, and popularity.

### Journey 3: Product Details & Recommendations
- **FR-PROD-1 (Details):** Display title, author, publisher/brand, category, description, ISBN, cover image URL, price, stock quantity, average rating, customer reviews, and **tentative delivery date** (e.g., "Arrives in 2-3 business days - by MM/DD/YYYY").
- **FR-PROD-2 (Related Products):** Display dynamically related products belonging to the same category or author.
- **FR-PROD-3 (History-based Recommendations):** Recommend items dynamically based on the customer's previous order categories and browsing history.

### Journey 4: Shopping Cart / Basket
- **FR-CART-1:** Add books to the cart with specified quantities.
- **FR-CART-2:** Update quantities or remove items from the basket.
- **FR-CART-3:** Calculate line item totals, subtotal, estimated shipping, applied discounts, and grand total.
- **FR-CART-4:** Cart persistence for logged-in users across sessions.

### Journey 5: Checkout & Payment
- **FR-PAY-1 (Delivery Address Selection):** Allow selection of an existing saved address or entering a new shipping address during checkout.
- **FR-PAY-2 (Payment Methods):** Support multiple payment options:
  - Credit Card (Visa, MasterCard, Amex)
  - Debit Card
  - Gift / Loyalty Points Redemption (1 point = $0.10 discount, up to full order amount)
- **FR-PAY-3 (Payment Processing):** Validate payment details, apply gift points reduction, calculate final amount charged, and create an immutable payment transaction record.
- **FR-PAY-4 (Order Confirmation):** Display order confirmation with unique Order ID, summary of items, tentative delivery timeline, shipping address, and payment receipt breakdown.

### Journey 6: Order History & Lifecycle
- **FR-ORD-1 (Order History):** View past orders with status (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **FR-ORD-2 ("Buy It Again"):** One-click button on previous order items to immediately re-add items to the active cart with current pricing and stock verification.
- **FR-ORD-3 (48-Hour Order Cancellation):** Customers can cancel an order within 48 hours of order placement if the status is `PLACED` or `PROCESSING`. Reverses payment status and refunds any redeemed gift points.
