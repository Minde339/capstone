# Data Model & PostgreSQL Database Requirements

## 1. Database Overview
- **Engine:** PostgreSQL 15+
- **Schema Name:** `ebookstore` (or default `public`)
- **Key Relationships:**
  - One `User` has many `Addresses`
  - One `User` has one active `Cart` with many `CartItems`
  - One `User` has many `Orders`
  - One `Order` has many `OrderItems` and one `Payment`
  - One `Category` has many `Books`
  - One `Publisher` has many `Books`
  - One `Book` has many `Reviews`

---

## 2. Table Specifications

### 2.1 `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt / Argon2 hashed password |
| `full_name` | VARCHAR(150) | NOT NULL | User's full name |
| `phone` | VARCHAR(50) | NULL | Phone number |
| `gift_points` | INTEGER | NOT NULL DEFAULT 100 | Loyalty reward points balance |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last update timestamp |

### 2.2 `addresses` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Address identifier |
| `user_id` | UUID / INTEGER | FK -> users(id) ON DELETE CASCADE | Associated user |
| `recipient_name` | VARCHAR(150) | NOT NULL | Contact name for delivery |
| `street` | VARCHAR(255) | NOT NULL | Street address line |
| `city` | VARCHAR(100) | NOT NULL | City |
| `state` | VARCHAR(100) | NULL | State / Province |
| `postal_code` | VARCHAR(20) | NOT NULL | ZIP / Postal code |
| `country` | VARCHAR(100) | NOT NULL | Country name |
| `is_default` | BOOLEAN | NOT NULL DEFAULT FALSE | Default shipping address flag |

### 2.3 `categories` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Category ID |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Category name (e.g. Fiction, Tech) |
| `slug` | VARCHAR(120) | UNIQUE, NOT NULL | URL-friendly slug |
| `description` | TEXT | NULL | Category description |

### 2.4 `publishers` (Brands) Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Publisher ID |
| `name` | VARCHAR(150) | UNIQUE, NOT NULL | Publisher / Brand name (e.g. O'Reilly) |
| `slug` | VARCHAR(170) | UNIQUE, NOT NULL | URL slug |

### 2.5 `books` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Book ID |
| `title` | VARCHAR(255) | NOT NULL | Book title |
| `author` | VARCHAR(200) | NOT NULL | Author name |
| `isbn` | VARCHAR(20) | UNIQUE, NOT NULL | ISBN-10 or ISBN-13 |
| `description` | TEXT | NOT NULL | Book synopsis / details |
| `price` | NUMERIC(10, 2) | NOT NULL | Retail price ($) |
| `stock_quantity` | INTEGER | NOT NULL DEFAULT 0 | Available stock count |
| `cover_image_url` | VARCHAR(500) | NULL | Cover image URL |
| `category_id` | INTEGER | FK -> categories(id) | Reference to category |
| `publisher_id` | INTEGER | FK -> publishers(id) | Reference to publisher |
| `rating` | NUMERIC(3, 2) | DEFAULT 0.00 | Average rating (1.00 to 5.00) |
| `review_count` | INTEGER | DEFAULT 0 | Total number of reviews |
| `delivery_days` | INTEGER | NOT NULL DEFAULT 3 | Estimated delivery turnaround in days |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Creation timestamp |

### 2.6 `carts` and `cart_items` Tables
| Table | Column | Type | Description |
|---|---|---|---|
| `carts` | `id`, `user_id`, `created_at`, `updated_at` | Active user basket session |
| `cart_items` | `id`, `cart_id`, `book_id`, `quantity`, `price_at_addition` | Line items in basket |

### 2.7 `orders` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Unique Order ID |
| `order_number` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order code (e.g. `EBK-2026-91823`) |
| `user_id` | UUID / INTEGER | FK -> users(id) | Buyer account |
| `address_id` | UUID / INTEGER | FK -> addresses(id) | Selected delivery address |
| `subtotal` | NUMERIC(10, 2) | NOT NULL | Items subtotal before discount/points |
| `discount_amount` | NUMERIC(10, 2) | NOT NULL DEFAULT 0.00 | Gift points / promotional discount |
| `shipping_fee` | NUMERIC(10, 2) | NOT NULL DEFAULT 0.00 | Delivery charge |
| `total_amount` | NUMERIC(10, 2) | NOT NULL | Final amount charged |
| `gift_points_redeemed` | INTEGER | NOT NULL DEFAULT 0 | Points applied to this order |
| `status` | VARCHAR(30) | NOT NULL DEFAULT 'PLACED' | `PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `estimated_delivery_date` | TIMESTAMPTZ | NOT NULL | Computed estimated delivery date |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Order placement timestamp |
| `cancelled_at` | TIMESTAMPTZ | NULL | Timestamp of cancellation if within 48h |

### 2.8 `order_items` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Line item ID |
| `order_id` | UUID / INTEGER | FK -> orders(id) ON DELETE CASCADE | Associated order |
| `book_id` | UUID / INTEGER | FK -> books(id) | Purchased book |
| `quantity` | INTEGER | NOT NULL | Units purchased |
| `unit_price` | NUMERIC(10, 2) | NOT NULL | Price at moment of purchase |
| `total_price` | NUMERIC(10, 2) | NOT NULL | `quantity * unit_price` |

### 2.9 `payments` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID / SERIAL | PRIMARY KEY | Payment transaction ID |
| `order_id` | UUID / INTEGER | FK -> orders(id) UNIQUE | Associated order |
| `payment_method` | VARCHAR(50) | NOT NULL | `CREDIT_CARD`, `DEBIT_CARD`, `GIFT_POINTS_FULL` |
| `amount_paid` | NUMERIC(10, 2) | NOT NULL | Amount charged |
| `status` | VARCHAR(30) | NOT NULL | `SUCCESS`, `PENDING`, `REFUNDED`, `FAILED` |
| `transaction_ref` | VARCHAR(100) | NOT NULL | Gateway transaction identifier |
| `card_last4` | VARCHAR(4) | NULL | Last 4 digits for receipt display |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Transaction timestamp |
