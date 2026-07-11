# MK Rockstar — Technical Documentation

> **Audience:** Developers and technical stakeholders  
> **Version:** v1.0.0

---

## Overall Architecture

MK Rockstar is a **static multi-page application (MPA)** with a serverless backend. There is no Node.js server, no API gateway, and no build pipeline required for the storefront. Each page is a self-contained HTML file that imports dependencies via CDN and communicates with Supabase directly using the JavaScript client library.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Vercel CDN (Static)                          │
│                                                                     │
│  index.html                    → redirect to /mk_rockstar_home/     │
│  mk_rockstar_home/code.html    → Homepage + Cart + Checkout         │
│  shop_all_mk_rockstar/code.html → Shop All page                     │
│  oversized_hoodie_mk_rockstar/code.html → Product detail            │
│  mk_rockstar_admin_suite/code.html → Admin SPA                      │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │  @supabase/supabase-js (CDN)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Supabase Platform                            │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL DB   │  │  Supabase Auth   │  │ Supabase Storage│  │
│  │                  │  │                  │  │                 │  │
│  │  • products      │  │  • admin session │  │ product-images  │  │
│  │  • deals         │  │  • email+pass    │  │   bucket        │  │
│  │  • customers     │  │                  │  │                 │  │
│  │  • orders        │  └──────────────────┘  └─────────────────┘  │
│  │  • order_items   │                                              │
│  │  • subscribers   │  ┌──────────────────────────────────────┐   │
│  └──────────────────┘  │     Supabase Edge Functions          │   │
│                         │     (Deno runtime)                   │   │
│                         │     send-order-email/index.ts        │   │
│                         └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                    Email Notification Flow
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              Resend API        EmailJS (fallback)
```

---

## Frontend

### Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | None (Vanilla) | Zero build step, maximum simplicity, fastest deployment |
| CSS | Tailwind CSS v4 via CDN | Rapid utility-class styling without compilation |
| Fonts | Google Fonts CDN | Anton (headlines) + Hanken Grotesk (body) |
| Icons | Google Material Symbols | Variable font icons, single CDN request |
| Supabase Client | `@supabase/supabase-js@2` CDN | Direct Supabase API access from browser |
| Storage | `localStorage` (cart) + `sessionStorage` (cache) | Client-side persistence without a server |

### Design System

All pages share an identical Tailwind design token set defined inline in a `<script id="tailwind-config">` block:

**Colour Palette (dark theme, Material Design 3 inspired):**

| Token | Value | Use |
|-------|-------|-----|
| `background` | `#131313` | Page background |
| `surface` | `#131313` | Surface containers |
| `surface-container` | `#201f1f` | Cards and drawers |
| `on-surface` | `#e5e2e1` | Primary text |
| `on-surface-variant` | `#cfc4c5` | Secondary text |
| `tertiary` | `#e9c349` | Gold accent (CTAs, active states) |
| `error` | `#ffb4ab` | Error/destructive actions |
| `outline` | `#988e90` | Input borders |

**Typography:**

| Token | Font | Size |
|-------|------|------|
| `display-xl` | Anton | 120px / -0.02em |
| `headline-lg` | Anton | 64px / 0.02em |
| `headline-md` | Anton | 32px / 0.05em |
| `body-lg` | Hanken Grotesk | 18px |
| `body-md` | Hanken Grotesk | 16px |
| `label-caps` | Hanken Grotesk | 12px / 0.15em / bold |

### Page Inventory

| File | URL Path | Purpose |
|------|----------|---------|
| `index.html` | `/` | Redirect to homepage |
| `mk_rockstar_home/code.html` | `/mk_rockstar_home/code.html` | Main storefront |
| `shop_all_mk_rockstar/code.html` | `/shop_all_mk_rockstar/code.html` | Full catalog |
| `oversized_hoodie_mk_rockstar/code.html` | `/oversized_hoodie_mk_rockstar/code.html` | Product detail |
| `mk_rockstar_admin_suite/code.html` | `/mk_rockstar_admin_suite/code.html` | Admin SPA |

---

## Supabase

**Project URL:** `https://aigyflxgtbkwhlhkdznd.supabase.co`  
**Anon Key:** Stored inline in HTML source (expected — protected by RLS policies)

### Client Initialization (all pages)

```javascript
const supabaseUrl = 'https://aigyflxgtbkwhlhkdznd.supabase.co';
const supabaseKey = 'eyJhbGci...';
const dbClient = window.supabase.createClient(supabaseUrl, supabaseKey);
```

The admin panel uses the variable name `dbClient` throughout. The homepage and storefront pages also use `dbClient`.

---

## Database

The PostgreSQL database on Supabase contains the following core tables:

| Table | Purpose |
|-------|---------|
| `products` | Product catalogue |
| `deals` | Promotional deals |
| `customers` | Customer records |
| `orders` | Order headers |
| `order_items` | Order line items |
| `subscribers` | Newsletter emails |

See [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) for full column-level documentation.

### Query Patterns

All queries use explicit column selection — `select('*')` is never used in production code. This prevents over-fetching and protects against schema changes leaking unexpected fields.

**Example — Products fetch:**
```javascript
const PRODUCT_COLS = 'id, name, category, color, price, badge, img_url, hex_color, is_new_arrival';
const { data, error } = await dbClient.from('products')
  .select(PRODUCT_COLS)
  .order('created_at', { ascending: false })
  .range(0, PAGE_SIZE - 1);
```

---

## Storage

**Bucket name:** `product-images`  
**Visibility:** Public (files are accessible via permanent public CDN URLs)

### File Naming Convention
```
product-{productId}-{Date.now()}.{ext}    → product images
deal-{dealId}-{Date.now()}.{ext}          → deal images
```

### Upload Sequence

```javascript
// 1. Upload to bucket
const { error } = await dbClient.storage
  .from('product-images')
  .upload(filename, blob, { contentType: mime, upsert: true });

// 2. Get public URL
const { data } = dbClient.storage
  .from('product-images')
  .getPublicUrl(filename);

// 3. Store URL in DB record
dbData.img_url = data.publicUrl;
```

### Image Compression Pipeline

Before uploading, images are processed in the browser:

```javascript
function processImage(file) {
  // Validate: JPG/PNG/WebP only, max 5 MB
  // Draw to canvas, max width 1400px (aspect ratio preserved)
  // Export: WebP @ 80% quality → fallback JPEG @ 80% quality
  // Return: { dataUrl, blob }
}
```

Typical output: a 1400 px wide WebP file < 300 KB from a multi-megabyte phone photo.

---

## Authentication

### Admin Auth Flow

1. Page load: `dbClient.auth.getSession()` → if no session, show login screen.
2. Login form submit: `dbClient.auth.signInWithPassword({ email, password })`.
3. Success: `onAuthStateChange` fires with the new session → `initApp()` is called.
4. Logout: `dbClient.auth.signOut()` → `onAuthStateChange` fires with `null` session → login screen shown.

### Session Storage
Supabase stores the JWT in `localStorage` automatically. The session refresh is handled by the Supabase client library.

### Protection
The admin content is wrapped in `<div id="app-content" style="display:none;">`. It becomes visible only after a valid session is confirmed. There is no server-side route protection — the files are static. The database RLS policies are the actual security boundary.

---

## Email System

### Architecture
Two-provider system with automatic fallback:

**Provider 1 — Resend (via Supabase Edge Function):**
```
storefront JS → fetch(SUPABASE_EDGE_FUNCTION_URL)
             → send-order-email/index.ts (Deno)
             → resend.emails.send({ template: { id, variables } })
             → Resend delivers to OWNER_EMAIL
```

**Provider 2 — EmailJS (browser fallback):**
```javascript
// Initialized in homepage <head>:
emailjs.init("2OKrNi3XdtW_PWkxa");

// Called if Resend edge function fails:
emailjs.send(serviceId, templateId, templateParams)
```

### Edge Function: `send-order-email`

**Location:** `supabase/functions/send-order-email/index.ts`  
**Runtime:** Deno  
**Imports:** `https://deno.land/std@0.168.0/http/server.ts`, `npm:resend@2.0.0`

**Environment Variables Required:**
- `RESEND_API_KEY` — Resend service API key
- `OWNER_EMAIL` — Recipient email for order notifications

**Request format:**
```json
{
  "orderData": {
    "order_id": "uuid",
    "customer_name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "address": "123 Street, Karachi",
    "total_amount": 4500,
    "payment_method": "Cash on Delivery",
    "items": [
      { "name": "Oversized Hoodie", "size": "L", "color": "Black", "qty": 2, "price": 2250 }
    ],
    "notes": ""
  }
}
```

**Email Template Variables:**
`ORDER_ID`, `CUSTOMER_NAME`, `CUSTOMER_EMAIL`, `CUSTOMER_PHONE`, `CUSTOMER_ADDRESS`, `TOTAL_AMOUNT`, `PAYMENT_METHOD`, `ORDER_SUMMARY_HTML`, `CUSTOMER_NOTES`

---

## API Flow

The storefront communicates with Supabase via the REST API exposed by the client library. All requests go to:

```
https://aigyflxgtbkwhlhkdznd.supabase.co/rest/v1/{table}
```

### Key API Calls by Feature

| Feature | Method | Table | Filters |
|---------|--------|-------|---------|
| Fetch products (homepage) | SELECT | `products` | Paginated, ordered by `created_at DESC` |
| Fetch deals (homepage) | SELECT | `deals` | `is_active = true` |
| Newsletter subscribe | INSERT | `subscribers` | None |
| Check existing customer | SELECT | `customers` | `email = ?` (maybeSingle) |
| Create customer | INSERT | `customers` | Returns `id` |
| Validate deal at checkout | SELECT | `deals` | `id IN (deal_ids)`, check `is_active` |
| Create order | INSERT | `orders` | Returns `id` |
| Create order items | INSERT | `order_items` | Batch insert |
| Admin: fetch products | SELECT | `products` | All columns, no filter |
| Admin: fetch deals | SELECT | `deals` | All columns, no filter |
| Admin: fetch customers | SELECT | `customers` | Ordered by `created_at DESC`, limit 100 |
| Admin: fetch orders | SELECT | `orders` | With customer join, ordered by `created_at DESC`, limit 100 |
| Admin: update product | UPDATE | `products` | `id = ?` |
| Admin: delete product | DELETE | `products` | `id = ?` (cascaded manually) |
| Admin: update deal | UPDATE | `deals` | `id = ?` |
| Admin: delete deal | DELETE | `deals` | `id = ?` |
| Admin: delete order | DELETE | `orders` + `order_items` | `id = ?` |

---

## Checkout Workflow

The complete checkout flow is implemented in `processCheckout()` in `mk_rockstar_home/code.html`:

```
1. Customer fills out form: First Name, Last Name, Email, Phone, Address
2. Cart total is calculated: cart.reduce((s,c) => s + c.price * c.qty, 0)
3. Customer upsert:
     - SELECT customers WHERE email = ?
     - If found: use existing customerId
     - If not found: INSERT new customer → get new customerId
4. Deal validation (if cart contains deals):
     - Batch SELECT deals WHERE id IN (dealIds)
     - Verify each deal.is_active = true
     - Throw if any deal is no longer active
5. Order creation:
     - INSERT orders { customer_id, total_amount, status: 'Pending', is_test_order? }
     - Returns order.id (UUID)
6. Order items creation:
     - Map cart items to order_items rows
     - UUID product IDs (deals without linked product) → resolve to fallback product ID
     - INSERT order_items[] batch
7. Email notification:
     - sendOrderNotification(order, customerData, cart, total)
     - Primary: Supabase Edge Function → Resend
     - Fallback: EmailJS browser SDK
8. Cart cleared, localStorage updated, modal closed, success toast shown
```

---

## Order Workflow

### Customer-Side
1. Order created in `orders` table with `status = 'Pending'`.
2. `order_items` rows created with `product_id`, `size`, `quantity`, `price_at_purchase`.
3. Email notification sent to owner.

### Admin-Side
1. Order appears in admin Orders table immediately.
2. Admin can view order details, update status, or delete.
3. Status options: Pending → Processing → Shipped → Delivered → Cancelled.
4. Status change is reflected in the UI immediately and a notification is pushed to the panel.

---

## Customer Workflow

1. Customer submits checkout form.
2. System checks `customers` table for existing record by email.
3. If new: a `customers` row is created with `email`, `first_name`, `last_name`, `phone`, `address`.
4. If returning: existing `customerId` is reused. (Customer details are not updated on re-order — this is a known limitation of v1.0.0.)
5. The `customer_id` is linked in the `orders` row.
6. Admin can view all customers in the Customers section, with tier calculated from total spend.

---

## Product Workflow

### Storefront (Read)
1. On page load, the `IntersectionObserver` watches the `#new-arrivals` section.
2. When it nears the viewport (within 200 px), `fetchProducts()` is triggered.
3. First, sessionStorage is checked for a `mk_products` key (5-minute TTL cache).
4. On cache miss: `SELECT products ORDER BY created_at DESC RANGE(0, 23)` (page 1).
5. On subsequent "Load More" clicks: range increments by 24.
6. Products are rendered as cards with lazy-loaded images.

### Admin (Write)
- Add → `INSERT products`
- Edit → `UPDATE products WHERE id = ?`
- Delete → cascade-delete deals + order_items + products

---

## Deal Workflow

### Storefront (Read)
1. `IntersectionObserver` watches the `#deals` section.
2. On entering viewport: `fetchDeals()` is called.
3. sessionStorage cache checked (`mk_deals`, 5-minute TTL).
4. On cache miss: `SELECT deals WHERE is_active = true`.
5. Deals rendered with discount percentage calculated inline.

### Admin (Write)
- Add → `INSERT deals`
- Edit → `UPDATE deals WHERE id = ?`
- Delete → `DELETE deals WHERE id = ?`

---

## Security

### Row Level Security (RLS)
Supabase RLS policies are the primary security layer. The `anon` role used in the browser can only perform operations permitted by RLS:
- **Public SELECT** on `products` and `deals` for the storefront.
- **Public INSERT** on `customers`, `orders`, `order_items`, and `subscribers` for checkout and newsletter.
- **Admin operations** (UPDATE, DELETE) require an authenticated Supabase session.

### Admin Panel
- Protected by Supabase Auth session gate in JavaScript.
- `noindex, nofollow` meta tag prevents search engine indexing.
- `robots.txt` disallows crawlers from the admin directory.

### Image Validation
- File type validation: only `image/jpeg`, `image/png`, `image/webp` accepted.
- File size validation: maximum 5 MB pre-compression.
- Validation is performed client-side in `processImage()` before any upload is initiated.

### Production Error Handling
Production error suppression in the admin:
```javascript
window.onerror = function() { return true; }; // Swallow JS errors silently
window.addEventListener('unhandledrejection', (e) => { e.preventDefault(); });
```

### Load Test Detection
The checkout system detects a `?loadtest=1` URL parameter and flags test orders with `is_test_order = true`. These can be bulk-deleted via the dev tool.

---

## Image Optimization

| Step | Detail |
|------|--------|
| Resize | Max 1400 px wide, aspect ratio preserved |
| Format | WebP (preferred) → JPEG (fallback) |
| Quality | 80% for both WebP and JPEG |
| Client-side | Canvas API — zero server-side processing |
| Upload | `upsert: true` allows re-uploading to same filename |
| CDN delivery | Supabase Storage serves files via CDN with permanent URLs |

All product images in the storefront use `loading="lazy"` and `decoding="async"` attributes for deferred rendering.

---

## Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| Lazy product loading | IntersectionObserver triggers fetch only when section nears viewport |
| Lazy deal loading | Same IntersectionObserver pattern, 200 px pre-load margin |
| sessionStorage caching | 5-minute TTL cache for products and deals avoids redundant Supabase calls |
| Cache invalidation | Admin CRUD operations call `clearStorefrontCache()` to remove stale session data |
| Pagination | Products loaded 24 at a time; "Load More" fetches next page |
| Explicit column selects | No `SELECT *` — only needed columns fetched from DB |
| Skeleton loading | 8 skeleton cards shown immediately while products load |
| Scroll reveal | `IntersectionObserver` for `.reveal` elements — CSS transition-based, no JavaScript animation loop |
| Image lazy load | `loading="lazy"` on all product images |
| Cart persistence | `localStorage` — cart survives page refresh/close without a server call |
| Debounced scroll | Nav and reveal scroll listeners use `{ passive: true }` flag |
| Chunked test order deletion | Bulk delete operates in 100-record chunks to avoid HTTP 400/414 errors |
