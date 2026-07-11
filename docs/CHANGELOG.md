# MK Rockstar — Changelog

All notable changes to the MK Rockstar project are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — July 2026

### Added — Customer Storefront

- **Homepage** (`mk_rockstar_home/code.html`)
  - Full-screen hero section with "WEAR THE SPOTLIGHT" headline, background lifestyle image, CTA buttons (SHOP NOW, EXPLORE COLLECTION), and animated scroll indicator
  - Glassmorphism navigation bar that transitions from transparent to blurred on scroll
  - Mobile slide-out navigation menu with overlay backdrop
  - Collections section with 4-cell bento grid (Hoodies, T-Shirts, Jackets, Old Money) — clicking a cell scrolls to and filters the product grid
  - New Arrivals section with IntersectionObserver lazy loading, skeleton loading cards, paginated product grid (24/page), and category filter tabs (ALL, HOODIES, JACKETS, T-SHIRTS, BOTTOMS)
  - "LOAD MORE" button for paginated product fetching
  - Deals section with IntersectionObserver lazy loading, discount % badge, and "GRAB DEAL" button
  - Brand Story section with background imagery
  - Why Choose Us section (Easy Returns, Nationwide Shipping, Secure Checkout)
  - Newsletter section with email capture saved to Supabase `subscribers` table
  - Footer with social links (Instagram, TikTok), policy links, and Shop column
  - Privacy Policy, Terms of Service, and Shipping & Returns inline modals
  - Open Graph and Twitter Card meta tags for social sharing
  - Canonical link tag for SEO

- **Shopping Experience**
  - Shopping cart drawer (slide from right) with quantity controls, item removal, and subtotal
  - Cart state persisted to `localStorage`
  - Wishlist system with heart icon toggle (FILL = wishlisted, gold colour), session Set storage
  - Wishlist badge counter on navigation
  - Quick View modal for products: image, name, price, size selector (XS–XXL), Add to Cart, Wishlist toggle
  - Quick View modal for deals: deal image, title, description, deal/original price, size selector, Add to Cart at deal price
  - Scroll-reveal animations for all content sections using IntersectionObserver

- **Checkout**
  - Checkout modal with form: First Name, Last Name, Email, Phone, Address fields
  - Customer upsert logic: new customers inserted, returning customers looked up by email
  - Deal validation at checkout: re-queries Supabase to verify `is_active = true` before processing
  - Order creation in `orders` table (status: Pending)
  - Order items creation in `order_items` table (size, quantity, price_at_purchase)
  - Loading spinner on submit button during processing
  - Cart cleared and success toast after successful checkout
  - Load test mode via `?loadtest=1`: randomised test emails, `is_test_order = true` flag

- **Email Notification**
  - Supabase Edge Function `send-order-email` (Deno) using Resend API
  - EmailJS browser fallback for when edge function is unreachable
  - Both providers configured in a dual-provider `sendOrderNotification()` function
  - Email template variables: ORDER_ID, CUSTOMER_NAME, CUSTOMER_EMAIL, CUSTOMER_PHONE, CUSTOMER_ADDRESS, TOTAL_AMOUNT, PAYMENT_METHOD, ORDER_SUMMARY_HTML, CUSTOMER_NOTES

- **sessionStorage Cache**
  - 5-minute TTL cache for products (`mk_products`) and deals (`mk_deals`)
  - Cache invalidated by admin panel after any CRUD mutation

### Added — Shop All Page

- Full product catalog (`shop_all_mk_rockstar/code.html`) with sidebar filters: All Categories, Hoodies, T-Shirts, Jackets, Bottoms, Old Money
- Price sorting controls
- Persistent cart integration across pages
- OG/Twitter meta tags

### Added — Product Detail Page

- Individual product page for Oversized Hoodie (`oversized_hoodie_mk_rockstar/code.html`)
- Size selector, add to cart, product information

### Added — Admin Panel

- **Authentication**
  - Supabase Auth email/password login screen
  - Session persistence via `localStorage` (Supabase client)
  - Auth state change listener for automatic login/logout UI transitions
  - Logout button

- **Dashboard**
  - Total Sales, Total Orders, Pending Orders, Revenue stat cards
  - Revenue bar chart (Monthly / Quarterly toggle) using `MONTHLY_DATA` and `QUARTERLY_DATA` arrays
  - Category breakdown bars (Outerwear, Footwear, Accessories, Others)
  - Recent Orders table (last 4 orders) with three-dot context menu
  - Session date display

- **Products**
  - Products grid (responsive: 1–4 columns)
  - Product cards with image, category badge, name, SKU, price, stock count
  - Search by name/SKU and category filter dropdown
  - Add Product modal: image upload, name, price, stock, category, SKU, description, New Arrival toggle
  - Edit Product: pre-fills modal with existing data
  - Delete Product: confirmation modal, cascade delete (deals + order_items + product)
  - Cache cleared on every save/delete

- **Deals**
  - Deals grid with Active/Inactive overlay badge
  - Add Deal modal: title, description, original price, deal price, linked product ID, image upload, active toggle
  - Edit Deal: pre-fills modal
  - Delete Deal: confirmation modal
  - Cache cleared on every save/delete

- **Image Upload System**
  - Shared between Products and Deals
  - Drag-and-drop upload zone with visual feedback (dashed border → gold on hover)
  - Click-to-browse file picker
  - Camera capture button (mobile `capture="environment"`)
  - `processImage()` pipeline: type validation, size validation, Canvas resize (max 1400 px), WebP compression at 80%, JPEG fallback
  - Upload progress shown on submit button ("UPLOADING IMAGE (64%)...")
  - Preview displayed in upload zone with hover-to-edit overlay
  - Remove Image button to clear selection

- **Orders**
  - Orders table (desktop) and card layout (mobile)
  - Load 50 orders initially, "LOAD MORE" in batches of 50
  - Search by order ID or customer name; filter by status
  - Three-dot context menu: VIEW DETAILS, UPDATE STATUS, DELETE ORDER
  - Order detail modal
  - Status update modal with 5 status options (colour-coded active state)
  - Delete order: removes `order_items` first, then `orders`
  - Test order badge (yellow "TEST" tag on `is_test_order = true` orders)
  - Dev tool: DELETE TEST ORDERS button (visible at `?devtools=1`) with chunked deletion (100 records/chunk)

- **Customers**
  - Customers summary cards (Total Customers, VIP Members, Avg Order Value)
  - Customer table (desktop) and card layout (mobile)
  - Search by name or email
  - Customer detail modal: name, joined date, email, phone, address, order count, total spent
  - Tier classification: New / Gold / VIP

- **Analytics**
  - KPI cards: Conversion Rate, Avg Order Value, Return Rate, Site Visits
  - Monthly Revenue bar chart
  - Category breakdown bars
  - Top Performing Products table (sorted by price)

- **Settings**
  - Store Profile form (Store Name, Admin Email, Currency, Timezone)
  - Notification toggles (New Order Alerts, Low Stock Warnings, Weekly Reports)

- **Notifications Panel**
  - Slide-in notifications panel from right
  - Unread indicator dot on bell icon
  - Mark all read on panel open
  - Clear All button
  - Notifications seeded with sample data; new notifications added on product/order events

- **UI / UX**
  - Glassmorphism card system for all content containers
  - Status badges with colour coding (Pending=gold, Shipped=gold, Processing=grey, Delivered=silver, Cancelled=red)
  - Toast notification system (success, error, info types)
  - Confirm delete modal for all destructive actions
  - Production error handler: silent swallow of uncaught errors and unhandled rejections
  - Responsive sidebar (off-canvas on mobile, fixed on desktop)
  - Mobile top navigation bar with hamburger and notification bell
  - `noindex, nofollow` meta tag to prevent search indexing

### Added — Infrastructure

- `index.html` — Root redirect to homepage via `<meta http-equiv="refresh">`
- `robots.txt` — Disallows `/mk_rockstar_admin_suite/`, Sitemap reference
- `sitemap.xml` — Three public pages with changefreq and priority
- `supabase/functions/send-order-email/index.ts` — Deno edge function
- Design token system: full Material Design 3 dark theme in Tailwind config
- Anton + Hanken Grotesk typography system
- Google Material Symbols icon integration
- `compress_db.js` — Batch image compression utility script
- `migrate_images.js` — Image migration utility script

---

## [Unreleased]

### Planned for v1.1.0
- Persist order status changes to Supabase database
- Customer-facing order confirmation email
- Customer record update on re-order
- Storage cleanup on product/deal deletion
- Real analytics from `order_items` data
- Settings persistence

### Planned for v2.0.0
- Online payment gateway (Easypaisa/JazzCash/Stripe)
- Customer account portal
- Multiple product images
- Product variants
- Discount codes
