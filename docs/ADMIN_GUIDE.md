# MK Rockstar — Admin Panel Guide

> **Audience:** Store administrator  
> **Version:** v1.0.0  
> **URL:** https://mkrockstar-testing.vercel.app/mk_rockstar_admin_suite/code.html

---

## Overview

The MK Rockstar Admin Suite is a single-page application (SPA) built directly in the `mk_rockstar_admin_suite/code.html` file. It communicates with Supabase over the `@supabase/supabase-js` client library (loaded via CDN). The panel is fully gated behind Supabase Auth — users who are not authenticated see only the login screen.

The admin is structured into six main sections accessible from the sidebar:

1. Dashboard
2. Products
3. Deals
4. Orders
5. Customers
6. Analytics
7. Settings

---

## Authentication

### Login Screen
When the admin URL is opened and no active Supabase session exists, the login screen is displayed full-screen. The underlying app content (`#app-content`) is hidden via `display:none`. On successful authentication via `dbClient.auth.signInWithPassword()`, the session is stored by the Supabase client and `initApp()` is triggered.

### Session Persistence
Supabase Auth persists the session in `localStorage`. Subsequent visits to the admin panel check for an active session with `dbClient.auth.getSession()` and bypass the login screen if valid.

### Logout
The **Log Out** button at the bottom of the sidebar calls `dbClient.auth.signOut()`, which clears the session and returns the user to the login screen.

---

## Dashboard

**Route:** Default view on login (`data-page="dashboard"`)

The Dashboard is the main overview screen. It contains:

### Statistics Cards
Four glassmorphism cards at the top of the dashboard, each clickable to navigate to the related section:

| Card | Data Source | Metric |
|------|------------|--------|
| **Total Sales** | Sum of all `orders.total_amount` | Formatted as Rs. X.XK |
| **Total Orders** | Count of all orders rows | Raw integer count |
| **Revenue** | Static display (Rs. 182.2K shown) | Dashboard context figure |
| **Pending Orders** | Count of orders with status `Pending` or `Processing` | Urgent action indicator |

### Revenue Chart
A CSS bar chart powered by JavaScript rendering. Two modes available:
- **Monthly** — Seven-bar chart (JAN–JUL) using `MONTHLY_DATA` array
- **Quarterly** — Four-bar chart (Q1–Q4) using `QUARTERLY_DATA` array

Toggle between modes with the MONTHLY / QUARTERLY buttons. The active mode is highlighted with a gold border.

### Category Breakdown
A four-row progress bar panel showing sales distribution by category (Outerwear 42%, Footwear 30%, Accessories 18%, Others 10%). These are calculated from `CATEGORIES_DATA`.

### Recent Orders Table
Displays the four most recent orders fetched from Supabase. Shows Order ID (truncated to 8 characters), Customer name (with initials avatar), Date, Amount, Status badge, and a three-dot context menu.

**Context Menu (⋮) Actions:**
- **View Details** — Opens order detail modal
- **Update Status** — Opens status update modal
- **Delete Order** — Opens confirmation modal, then hard-deletes from DB

### Session Date
Current date is displayed in the top-right of the desktop dashboard header and below the heading on mobile.

### Notifications Bell
Opens the notification panel. New notifications (unread) show a gold dot indicator. Clicking the bell marks all as read.

---

## Products

**Route:** `data-page="products"` — accessed via sidebar

### Products Grid
Products are displayed as cards in a 1–4 column responsive grid (1 on mobile, 2 on small, 3 on medium, 4 on large screens). Each card shows:
- Product image (with "NO IMAGE" placeholder if `img_url` is null)
- Category badge (top-right overlay)
- Product name and SKU
- Description snippet
- Price (Rs. format, Anton font)
- Stock count (turns red if ≤ 5)
- Edit button (pencil icon)
- Delete button (bin icon)

### Search and Filter
- **Search box:** Filters by product name or SKU (case-insensitive, real-time via `oninput`)
- **Category dropdown:** Filters by Outerwear, Footwear, Accessories, Tops, or Bottoms

### Add Product Modal
Opens from the **ADD PRODUCT** button in the header or the sidebar button. Fields:

| Field | Required | Description |
|-------|----------|-------------|
| Product Image | No | Drag/drop or click upload. Camera capture on mobile. |
| Mark as New Arrival | No | Checkbox — adds product to homepage New Arrivals section |
| Product Name | Yes | Display name shown to customers |
| Price (PKR) | Yes | Numeric price in Pakistani Rupees |
| Stock | Yes | Integer stock quantity |
| Category | Yes | Outerwear / Footwear / Accessories / Tops / Bottoms |
| SKU | No | Auto-prefixed with "MK-" from product ID if not set |
| Description | No | Free-text description |

### Image Upload System
The product image upload uses the browser **Canvas API** for client-side compression before sending to Supabase Storage:

1. File is validated: only `image/jpeg`, `image/png`, `image/webp` are accepted; maximum 5 MB.
2. Image is drawn onto an HTML `<canvas>` element. If width > 1400 px, it is scaled down proportionally.
3. Canvas is exported to WebP at 80% quality. If the browser doesn't support WebP output, JPEG is used as a fallback.
4. The resulting Blob is uploaded to the `product-images` Supabase Storage bucket with `upsert: true`.
5. The public URL is retrieved via `getPublicUrl()` and stored in `products.img_url`.

Upload progress is shown on the submit button text (e.g., "UPLOADING IMAGE (64%)...").

### Edit Product
Clicking the pencil icon calls `editProduct(id)` → `openProductModal(id)`. The modal is pre-filled with the existing product data. Submitting calls `dbClient.from('products').update(dbData).eq('id', id)`.

### Delete Product
Clicking the bin icon triggers `confirmDeleteProduct(id)`. A modal asks for confirmation. On confirm:
1. Linked deals are deleted first: `dbClient.from('deals').delete().eq('product_id', id)`
2. Linked order items are deleted: `dbClient.from('order_items').delete().eq('product_id', id)`
3. The product itself is deleted: `dbClient.from('products').delete().eq('id', id)`
4. Products array is refreshed from DB and re-rendered.
5. Storefront cache is cleared: `sessionStorage.removeItem('mk_products')` and `sessionStorage.removeItem('mk_deals')`.

---

## Deals

**Route:** `data-page="deals"` — accessed via sidebar

### Deals Grid
Deals are displayed as cards similar to the products grid. Each card shows:
- Deal image
- Active/Inactive badge (green/red overlay)
- Deal title
- Description
- Deal price (large, Anton font) and original price (strikethrough)
- Edit and Delete buttons

### Add Deal Modal
Opens from the **ADD DEAL** button. Fields:

| Field | Required | Description |
|-------|----------|-------------|
| Deal Title | Yes | Name of the promotion |
| Description | No | Short promotional copy |
| Original Price | Yes | Full retail price (shown struck through) |
| Deal Price | Yes | Discounted sale price |
| Linked Product ID | No | Optional: links deal to a specific product for cart resolution |
| Deal Image | No | Image for the deal card (same upload/compression pipeline as products) |
| Active | Yes | Toggle — only active deals are shown on the storefront |

### Deal Image Upload
Identical pipeline to the product image: browser-side Canvas compression → Supabase Storage `product-images` bucket → public URL stored in `deals.image_url`.

Filename pattern: `deal-{finalId}-{timestamp}.{ext}`

### Edit Deal
Clicking the pencil icon calls `editDeal(id)` → `openDealModal(id)`. Modal pre-fills all fields from the existing deal record. Submitting calls `dbClient.from('deals').update(dbData).eq('id', id)`.

### Delete Deal
Clicking the bin icon calls `confirmDeleteDeal(id)`. On confirmation, `dbClient.from('deals').delete().eq('id', id)` is called. The storefront cache is invalidated.

### Active/Inactive Toggle
The **ACTIVE** checkbox in the deal form sets `is_active` in the database. Only deals with `is_active = true` are fetched by the storefront.

---

## Orders

**Route:** `data-page="orders"` — accessed via sidebar

### Orders List
On desktop: full table with columns ORDER ID, CUSTOMER, DATE, ITEMS, AMOUNT, STATUS, ACTION.  
On mobile: card layout with the same data in a compact format.

Orders are paginated — 50 are loaded initially. A **LOAD MORE** button appears if there are additional orders.

### Search & Filter
- **Search box:** Filters by order ID or customer name
- **Status dropdown:** Filters to show only orders of a specific status

### Status Badges
Each order status displays with a colour-coded border:

| Status | Badge Style |
|--------|------------|
| Pending | Gold border / gold text (0.7 opacity) |
| Processing | White/grey border |
| Shipped | Gold border / gold text |
| Delivered | Silver border / silver text |
| Cancelled | Red border / red text |

### Context Menu (⋮)
For each order row, clicking the three-dot button opens a floating context menu:
- **VIEW DETAILS** — Modal showing customer name, date, amount, item count, status, with buttons to update status or delete.
- **UPDATE STATUS** — Modal with five status buttons. Currently selected status is highlighted in gold. Clicking a new status calls `updateStatus(orderId, newStatus)`, which updates the in-memory array and re-renders the UI. A notification is pushed to the notification panel.
- **DELETE ORDER** — Confirmation modal, then deletes `order_items` rows first (by `order_id`), then the `orders` row.

> **Note:** The current implementation updates order status in the UI/memory immediately but does NOT persist the status change to the Supabase database in the current code. This is by design for the initial release — status updates are logged internally. A DB persistence step can be added as a future enhancement.

### Dev Tool — Delete Test Orders
The **DELETE TEST ORDERS** button (amber, hidden by default) is only visible when the URL includes `?devtools=1`. It fetches all orders where `is_test_order = true`, then deletes them in chunks of 100 to avoid request-URI length limits. Used to clean up after load testing.

---

## Customers

**Route:** `data-page="customers"` — accessed via sidebar

### Customer Statistics Cards
Three summary cards above the customer table:
- **Total Customers** — Count of unique customer records
- **VIP Members** — Displayed as static value (3) in current build
- **Avg Order Value** — Displayed as Rs. 892 in current build

### Customer Table
Columns: CUSTOMER (name + initials avatar), EMAIL, ORDERS, TOTAL SPENT, TIER, JOINED.

Rows are clickable and open the **Customer Detail Modal**.

### Customer Detail Modal
Shows full customer profile:
- Name and initials avatar
- Customer since (join date)
- Email address
- Phone number
- Shipping address
- Total orders count and total amount spent

### Tier Classification
Tiers are calculated client-side based on `total_amount` across all orders:

| Tier | Condition |
|------|-----------|
| New | Spent < Rs. 15,000 |
| Gold | Spent Rs. 15,000 – Rs. 50,000 |
| VIP | Spent > Rs. 50,000 |

### Search
The **Search customers** box filters by name or email in real time.

---

## Analytics

**Route:** `data-page="analytics"` — accessed via sidebar

### KPI Cards
Four metric cards:
- **Conversion Rate** — 3.8% (+0.4% this month)
- **Avg Order Value** — Rs. 892 (+Rs. 34 this month)
- **Return Rate** — 2.1% (-0.2% this month)
- **Site Visits** — 48.2K (+18% this month)

### Monthly Revenue Chart
Full-width bar chart spanning Jan–Jul with animated bars. Powered by `MONTHLY_DATA` array.

### Category Breakdown
Progress bars for each category: Outerwear (42%), Footwear (30%), Accessories (18%), Tops (7%), Bottoms (3%).

### Top Performing Products
A table of the top 5 products by price (from the live products array). Shows product name, category, units sold (simulated), revenue (simulated), and trend percentage (simulated). Real sales analytics can be connected to `order_items` data as a future enhancement.

---

## Settings

**Route:** `data-page="settings"` — accessed via sidebar

### Store Profile Card
Form fields for:
- Store Name (pre-filled: "MK Rockstar")
- Admin Email (pre-filled: "admin@mkrockstar.com")
- Currency (USD, PKR, EUR, GBP)
- Timezone (Asia/Karachi default)

**SAVE CHANGES** button shows a success toast. (Settings are UI-only in v1.0.0 — persistence is a future enhancement.)

### Notifications Card
Three toggle switches:
- **New Order Alerts** — ON by default
- **Low Stock Warnings** — ON by default (threshold: 5 units)
- **Weekly Reports** — OFF by default (email summary every Monday)

Each toggle shows a success toast on change.

---

## Image Upload System (Full Detail)

The image upload system is shared between Products and Deals. The pipeline is:

```
User selects file (click / drag-drop / camera)
            ↓
processImage(file)
  ├── Validate type (JPG / PNG / WebP only)
  ├── Validate size (≤ 5 MB)
  ├── Draw to canvas, scale down if width > 1400 px
  ├── Export to WebP @ 80% quality (JPEG fallback)
  └── Convert dataURL → Blob
            ↓
setImagePreview(dataUrl)  ← shows preview in the upload zone
            ↓
On form submit: upload Blob to Supabase Storage
  bucket: product-images
  filename: product-{id}-{timestamp}.{ext}  OR  deal-{id}-{timestamp}.{ext}
  upsert: true
            ↓
getPublicUrl(filename)  ← Supabase returns a permanent CDN URL
            ↓
Store URL in products.img_url OR deals.image_url
```

---

## Email Workflow

When a customer completes checkout, the storefront triggers the `send-order-email` Supabase Edge Function:

```
Customer places order
        ↓
processCheckout() in homepage JS
        ↓
sendOrderNotification(order, customerData, cart, total)
        ↓
  [Primary] fetch POST to Supabase Edge Function URL
       /functions/v1/send-order-email
       Body: { orderData: { order_id, customer_name, email, phone, address, total_amount, items[] } }
        ↓
  Edge Function calls Resend API
  → From: onboarding@resend.dev
  → To: OWNER_EMAIL (Supabase secret)
  → Template ID: 9675a370-863a-48ed-8133-c0ecb6c53fae
  → Variables: ORDER_ID, CUSTOMER_NAME, CUSTOMER_EMAIL, CUSTOMER_PHONE, CUSTOMER_ADDRESS,
               TOTAL_AMOUNT, PAYMENT_METHOD, ORDER_SUMMARY_HTML, CUSTOMER_NOTES
        ↓
  [Fallback] if Resend fails → EmailJS browser SDK
  (emailjs.send with service and template configured at init)
```

---

## Mobile Considerations

The Admin Panel is fully responsive:

- **Sidebar** is off-canvas on screens < 1024 px (lg breakpoint). Open via hamburger menu in the top navigation bar.
- **Mobile Top Nav** (`#mobile-topnav`) is hidden on desktop and shown on mobile — contains the logo, notification bell, and hamburger button.
- **Tables** become card layouts on screens < 768 px (md breakpoint) using separate `#orders-mobile`, `#customers-mobile`, `#dash-orders-mobile` containers.
- **Modals** are full-screen on small screens, centered on large screens.
- **Image upload** includes a TAKE PHOTO button that triggers the device camera via `<input capture="environment">`.
- Sidebar auto-closes when navigating on mobile (`window.innerWidth < 1024`).
