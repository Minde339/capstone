# API Specification Requirements

## 1. OpenAPI 3.0 Standard
All endpoints follow RESTful conventions, JSON payloads, HTTP status codes, and JWT Bearer authorization where protected.

---

## 2. Endpoints Inventory

### 2.1 Authentication & Profile
- `POST /api/auth/register` - Create user account (returns token + user profile with welcome gift points)
- `POST /api/auth/login` - Authenticate with email/password (returns token + profile)
- `GET /api/auth/me` - Retrieve current authenticated user profile & points
- `GET /api/user/addresses` - List user saved delivery addresses
- `POST /api/user/addresses` - Add new delivery address
- `PUT /api/user/addresses/:id` - Update delivery address
- `DELETE /api/user/addresses/:id` - Remove address

### 2.2 Catalogue & Products
- `GET /api/categories` - List all book categories
- `GET /api/publishers` - List all publishers/brands
- `GET /api/books` - Search & filter books (Query params: `search`, `category`, `publisher`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`)
- `GET /api/books/:id` - Get detailed book info including reviews, stock, and tentative delivery date
- `GET /api/books/:id/related` - Get related books in same category/author
- `GET /api/books/recommendations` - Get personalized recommendations based on past order history and trending categories

### 2.3 Shopping Cart
- `GET /api/cart` - Get user active basket with calculated totals
- `POST /api/cart/items` - Add book to basket `{ bookId, quantity }`
- `PUT /api/cart/items/:itemId` - Update quantity `{ quantity }`
- `DELETE /api/cart/items/:itemId` - Remove item from basket
- `DELETE /api/cart` - Clear entire basket

### 2.4 Orders & Checkout
- `POST /api/checkout/quote` - Calculate checkout summary (subtotal, shipping, gift points deduction, final total)
- `POST /api/orders` - Place order & process payment `{ addressId, paymentMethod, cardDetails?, redeemGiftPoints }`
- `GET /api/orders` - List current user order history
- `GET /api/orders/:id` - Get single order details with tracking status and items
- `POST /api/orders/:id/cancel` - Cancel order within 48-hour window (reverses payment & restores gift points)
- `POST /api/orders/:id/reorder` - "Buy It Again": re-adds all items from previous order into current cart
