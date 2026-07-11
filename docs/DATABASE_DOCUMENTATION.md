# MK Rockstar — Database Documentation

> **Database Provider:** Supabase (PostgreSQL)  
> **Project URL:** https://aigyflxgtbkwhlhkdznd.supabase.co  
> **Version:** v1.0.0

---

## Overview

The database is a PostgreSQL instance hosted on Supabase. All tables use UUID primary keys generated server-side except for `products`, which uses a BigInt ID assigned by the client (set to `Date.now()` on insert from the admin panel). Row Level Security (RLS) is enforced at the database level.

---

## Table: `products`

**Purpose:** The master product catalogue. Every item available for purchase in the store is stored here.

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `bigint` | NOT NULL | Primary key. Set by client to `Date.now()` on insert. |
| `name` | `text` | NOT NULL | Product display name (e.g. "Oversized Hoodie"). |
| `category` | `text` | NOT NULL | Product category. Valid values: `Outerwear`, `Footwear`, `Accessories`, `Tops`, `Bottoms`. Also accepts storefront values: `Hoodies`, `T-Shirts`, `Jackets`, `Old Money`, `Bottoms`. |
| `color` | `text` | Nullable | Product colour label (e.g. "Black", "Charcoal"). Defaults to `'DEFAULT'` when saved from admin. |
| `price` | `numeric` | NOT NULL | Sale price in PKR. |
| `badge` | `text` | Nullable | Optional badge label shown on product card (e.g. "NEW", "HOT"). |
| `img_url` | `text` | Nullable | Public URL to the product image in Supabase Storage. |
| `hex_color` | `text` | Nullable | Hex colour code for colour swatch. Defaults to `'#000000'` when saved from admin. |
| `is_new_arrival` | `boolean` | NOT NULL | If `true`, product appears in the homepage New Arrivals section. Default `true` on admin insert. |
| `created_at` | `timestamp with time zone` | Nullable | Supabase auto-populated creation timestamp. |

### Primary Key
`id` (bigint)

### Foreign Keys
None.

### Relationships
- Referenced by `deals.product_id` (optional link)
- Referenced by `order_items.product_id`

### Typical CRUD Operations

**SELECT (storefront — explicit columns, paginated):**
```sql
SELECT id, name, category, color, price, badge, img_url, hex_color, is_new_arrival
FROM products
ORDER BY created_at DESC
LIMIT 24 OFFSET 0;
```

**SELECT (admin — all data):**
```sql
SELECT id, name, category, color, price, badge, img_url, hex_color, is_new_arrival, created_at
FROM products;
```

**INSERT (admin — new product):**
```sql
INSERT INTO products (id, name, category, color, hex_color, price, is_new_arrival, img_url)
VALUES (1720000000000, 'Oversized Hoodie', 'Outerwear', 'DEFAULT', '#000000', 3500, true,
        'https://...supabase.co/storage/v1/object/public/product-images/product-xxx.webp');
```

**UPDATE (admin — edit product):**
```sql
UPDATE products
SET name = 'Updated Name', price = 4000, category = 'Outerwear'
WHERE id = 1720000000000;
```

**DELETE (admin — cascaded):**
```sql
-- Step 1: Delete linked deals
DELETE FROM deals WHERE product_id = 1720000000000;
-- Step 2: Delete linked order items
DELETE FROM order_items WHERE product_id = 1720000000000;
-- Step 3: Delete product
DELETE FROM products WHERE id = 1720000000000;
```

---

## Table: `deals`

**Purpose:** Promotional deals displayed in the "Deals" section of the homepage and Shop All page. Each deal has an original price and a discounted deal price.

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `bigint` | NOT NULL | Primary key. Set by client to `Date.now()` on insert. |
| `title` | `text` | NOT NULL | Deal display name (e.g. "Summer Blowout"). |
| `description` | `text` | Nullable | Short promotional description shown on the deal card. |
| `product_id` | `bigint` | Nullable | Optional FK to `products.id`. Used to link a deal to a specific product for cart resolution. |
| `original_price` | `numeric` | NOT NULL | Full retail price before discount. Shown struck through. |
| `deal_price` | `numeric` | NOT NULL | Discounted sale price. Shown prominently. |
| `image_url` | `text` | Nullable | Public URL to the deal image in Supabase Storage. |
| `start_date` | `timestamp with time zone` | Nullable | Deal start date (stored as `null` in v1.0.0 — not enforced). |
| `end_date` | `timestamp with time zone` | Nullable | Deal end date (stored as `null` in v1.0.0 — not enforced). |
| `is_active` | `boolean` | NOT NULL | If `true`, deal is shown on the storefront. |
| `created_at` | `timestamp with time zone` | Nullable | Supabase auto-populated creation timestamp. |

### Primary Key
`id` (bigint)

### Foreign Keys
| Column | References | On Delete |
|--------|-----------|-----------|
| `product_id` | `products(id)` | No constraint enforced in code — manually deleted before product removal |

### Relationships
- References `products` via `product_id` (optional)

### Typical CRUD Operations

**SELECT (storefront — active deals only):**
```sql
SELECT id, title, description, original_price, deal_price, image_url, product_id
FROM deals
WHERE is_active = true;
```

**SELECT (admin — all deals):**
```sql
SELECT id, title, description, product_id, original_price, deal_price,
       image_url, start_date, end_date, is_active, created_at
FROM deals;
```

**INSERT:**
```sql
INSERT INTO deals (title, description, product_id, original_price, deal_price, image_url, is_active)
VALUES ('Flash Sale', 'Limited time offer', null, 5000, 3500,
        'https://...supabase.co/.../deal-xxx.webp', true);
```

**UPDATE:**
```sql
UPDATE deals
SET is_active = false, deal_price = 3000
WHERE id = 1720000000001;
```

**DELETE:**
```sql
DELETE FROM deals WHERE id = 1720000000001;
```

---

## Table: `customers`

**Purpose:** Stores customer records created at checkout. A customer record is created on first order and reused on subsequent orders identified by email.

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NOT NULL | Primary key. Supabase auto-generated UUID. |
| `email` | `text` | NOT NULL | Customer email address. Used as the unique identifier for customer lookup. |
| `first_name` | `text` | Nullable | Customer first name from checkout form. |
| `last_name` | `text` | Nullable | Customer last name from checkout form. |
| `phone` | `text` | Nullable | Phone number from checkout form. |
| `address` | `text` | Nullable | Delivery address from checkout form. |
| `created_at` | `timestamp with time zone` | Nullable | Supabase auto-populated timestamp of first order. |

### Primary Key
`id` (uuid)

### Foreign Keys
None.

### Relationships
- Referenced by `orders.customer_id`

### Typical CRUD Operations

**SELECT (check for existing customer at checkout):**
```sql
SELECT id FROM customers WHERE email = 'customer@example.com' LIMIT 1;
```

**INSERT (new customer):**
```sql
INSERT INTO customers (email, first_name, last_name, phone, address)
VALUES ('customer@example.com', 'Ali', 'Khan', '03001234567', 'Karachi, Pakistan')
RETURNING id;
```

**SELECT (admin — customer list with order stats):**
```sql
SELECT id, email, first_name, last_name, phone, address, created_at
FROM customers
ORDER BY created_at DESC
LIMIT 100;
```

---

## Table: `orders`

**Purpose:** Order headers. Each completed checkout creates one row. Connected to customers and order_items.

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NOT NULL | Primary key. Supabase auto-generated UUID. |
| `customer_id` | `uuid` | Nullable | FK to `customers.id`. |
| `total_amount` | `numeric` | NOT NULL | Total order value in PKR. Sum of `(price_at_purchase × quantity)` for all items. |
| `status` | `text` | NOT NULL | Order lifecycle status. Valid values: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`. Default: `Pending`. |
| `is_test_order` | `boolean` | Nullable | Set to `true` for orders created during load testing. Used to identify and bulk-delete test data. |
| `created_at` | `timestamp with time zone` | Nullable | Supabase auto-populated order creation timestamp. |

### Primary Key
`id` (uuid)

### Foreign Keys
| Column | References | Behaviour |
|--------|-----------|-----------|
| `customer_id` | `customers(id)` | Nullable — order can exist without a customer record |

### Relationships
- References `customers` via `customer_id`
- Referenced by `order_items.order_id`

### Typical CRUD Operations

**INSERT (checkout — create order):**
```sql
INSERT INTO orders (customer_id, total_amount, status)
VALUES ('uuid-of-customer', 4500.00, 'Pending')
RETURNING id;
```

**SELECT (admin — recent orders with customer join):**
```sql
SELECT o.id, o.customer_id, o.total_amount, o.status, o.created_at, o.is_test_order,
       c.first_name, c.last_name
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
ORDER BY o.created_at DESC
LIMIT 100;
```

**SELECT (admin — lightweight totals for stats):**
```sql
SELECT customer_id, total_amount, status FROM orders;
```

**DELETE (admin — delete order and items):**
```sql
-- Step 1: Delete items
DELETE FROM order_items WHERE order_id = 'uuid-of-order';
-- Step 2: Delete order
DELETE FROM orders WHERE id = 'uuid-of-order';
```

**DELETE (bulk test order cleanup):**
```sql
-- Delete items chunk
DELETE FROM order_items WHERE order_id IN ('uuid1', 'uuid2', ..., 'uuid100');
-- Delete orders chunk
DELETE FROM orders WHERE id IN ('uuid1', 'uuid2', ..., 'uuid100');
```

---

## Table: `order_items`

**Purpose:** Line items for each order. One row per product per order. Stores the price at the time of purchase (independent of future product price changes).

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NOT NULL | Primary key. Supabase auto-generated UUID. |
| `order_id` | `uuid` | NOT NULL | FK to `orders.id`. |
| `product_id` | `bigint` | Nullable | FK to `products.id`. May be `null` for deals without a linked product (resolved to a fallback product at checkout). |
| `size` | `text` | NOT NULL | Selected size. Values: `XS`, `S`, `M`, `L`, `XL`, `XXL`. Default `M` if not selected. |
| `quantity` | `integer` | NOT NULL | Quantity ordered. Default `1` if not provided. |
| `price_at_purchase` | `numeric` | NOT NULL | Unit price at the time of order. Frozen at checkout, unaffected by future price changes. |

### Primary Key
`id` (uuid)

### Foreign Keys
| Column | References | Notes |
|--------|-----------|-------|
| `order_id` | `orders(id)` | Required |
| `product_id` | `products(id)` | Nullable (deals without linked products use fallback ID) |

### Typical CRUD Operations

**INSERT (checkout — create line items):**
```sql
INSERT INTO order_items (order_id, product_id, size, quantity, price_at_purchase)
VALUES
  ('order-uuid', 1720000000001, 'L', 2, 3500.00),
  ('order-uuid', 1720000000002, 'M', 1, 2000.00);
```

**SELECT (for email notification — items in order):**
Resolved client-side from the `cart` array at time of checkout. Not re-fetched from DB for email.

**DELETE (cascade when deleting order):**
```sql
DELETE FROM order_items WHERE order_id = 'order-uuid';
```

**DELETE (cascade when deleting product):**
```sql
DELETE FROM order_items WHERE product_id = 1720000000001;
```

---

## Table: `subscribers`

**Purpose:** Email addresses captured from the newsletter subscription form in the homepage footer.

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | NOT NULL | Primary key. Supabase auto-generated UUID. |
| `email` | `text` | NOT NULL | Subscriber's email address. |
| `created_at` | `timestamp with time zone` | Nullable | Supabase auto-populated subscription timestamp. |

### Primary Key
`id` (uuid)

### Typical CRUD Operations

**INSERT (newsletter signup):**
```sql
INSERT INTO subscribers (email) VALUES ('subscriber@example.com');
```

---

## Auth / Admin Tables

Authentication is handled by Supabase Auth — a managed service. The underlying tables are in the `auth` schema (not the `public` schema) and are managed entirely by Supabase. They are not directly queried by the application.

Relevant Supabase Auth concepts:

| Concept | Detail |
|---------|--------|
| Admin user | A single admin user created in the Supabase Auth panel |
| Sign-in method | Email + password (`signInWithPassword`) |
| Session storage | JWT stored in browser `localStorage` by the Supabase client |
| Token refresh | Handled automatically by `@supabase/supabase-js` |
| RLS context | Authenticated requests carry the user's JWT; RLS policies use `auth.uid()` and `auth.role()` to grant elevated permissions |

---

## Entity Relationship Diagram

```
products (id PK bigint)
    ├── deals.product_id FK → optional link
    └── order_items.product_id FK → line item link

customers (id PK uuid)
    └── orders.customer_id FK

orders (id PK uuid)
    ├── customers.customer_id FK
    └── order_items.order_id FK

order_items (id PK uuid)
    ├── orders.order_id FK
    └── products.product_id FK (nullable)

subscribers (id PK uuid) — standalone
deals (id PK bigint) — references products optionally
```
