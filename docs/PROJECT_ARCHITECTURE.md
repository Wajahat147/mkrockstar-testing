# MK Rockstar — Project Architecture

> **Version:** v1.0.0

---

## System Overview

MK Rockstar is a **static multi-page application (MPA)** delivered via a global CDN (Vercel) with a managed cloud backend (Supabase). There is no server-side rendering, no dedicated application server, and no build pipeline for the storefront.

---

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                              │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Homepage   │  │  Shop All    │  │     Admin Panel          │   │
│  │  (Storefront│  │  (Catalog)   │  │  (Protected, Auth-gated) │   │
│  │  + Cart +   │  │              │  │                          │   │
│  │  Checkout)  │  │              │  │                          │   │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬──────────────┘   │
│         │                │                       │                  │
│         └────────────────┴───────────────────────┘                  │
│                          │                                          │
│                   Supabase JS Client                                │
│               (@supabase/supabase-js v2)                            │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               │ HTTPS (REST API + Auth + Storage)
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       SUPABASE PLATFORM                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  PostgreSQL Database                        │    │
│  │                                                             │    │
│  │   products     deals      customers                         │    │
│  │   orders       order_items   subscribers                    │    │
│  │                                                             │    │
│  │   RLS policies on all tables                                │    │
│  └──────────────────────┬──────────────────────────────────────┘    │
│                         │                                           │
│  ┌──────────────┐       │       ┌──────────────────────────────┐   │
│  │ Supabase Auth│       │       │      Supabase Storage        │   │
│  │              │       │       │   bucket: product-images     │   │
│  │  Admin user  │       │       │   (public, CDN-delivered)    │   │
│  │  email+pass  │       │       │                              │   │
│  └──────────────┘       │       └──────────────────────────────┘   │
│                         │                                           │
│  ┌──────────────────────┴───────────────────────────────────────┐   │
│  │            Supabase Edge Functions (Deno)                    │   │
│  │                                                              │   │
│  │   send-order-email/index.ts                                  │   │
│  │   → Triggered by checkout HTTP POST                          │   │
│  │   → Calls Resend API with order details                      │   │
│  │   → Env secrets: RESEND_API_KEY, OWNER_EMAIL                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
              ┌──────────┐         ┌──────────────┐
              │  Resend  │         │   EmailJS    │
              │  (Primary│         │  (Fallback)  │
              │  Email)  │         │              │
              └──────────┘         └──────────────┘
```

---

## Frontend Application Structure

### Multi-Page Architecture
Rather than a traditional SPA with a router, MK Rockstar uses separate HTML files for each major page. This approach provides:
- Zero JavaScript framework overhead
- Fast initial page loads (each page is self-contained)
- Browser-native navigation and back/forward behaviour
- Simple deployment (any static host)

### Page Map

```
/ (index.html)
│
├── /mk_rockstar_home/code.html         [PUBLIC]
│     Sections: Hero → Collections → New Arrivals → Deals →
│               Brand Story → Why Us → Newsletter → Footer
│     Overlays: Cart Drawer, Wishlist Drawer, Quick View Modal,
│               Checkout Modal, Policy Modals, Toast, QV Modal
│
├── /shop_all_mk_rockstar/code.html     [PUBLIC]
│     Sections: Nav → Sidebar Filters → Product Grid → Footer
│
├── /oversized_hoodie_mk_rockstar/code.html [PUBLIC]
│     Sections: Nav → Product Detail → Size Selector → Cart →
│               Related Products → Footer
│
└── /mk_rockstar_admin_suite/code.html  [AUTH PROTECTED]
      Login Screen (conditional) → Dashboard → Products →
      Deals → Orders → Customers → Analytics → Settings
      Modals: Product, Deal, Order, Customer, Status, Confirm, Notification
```

---

## Admin Panel Internal Architecture

The admin panel is a single-file SPA with internal navigation:

### Navigation System
```javascript
// State: current page
let currentPage = 'dashboard';

// Navigate by showing/hiding sections
function navigate(page) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
  document.getElementById('page-' + page)?.classList.remove('hidden');
  currentPage = page;
}
```

### State Management
Global in-memory state arrays:

```javascript
let products = [];    // Fetched from Supabase, maintained in memory
let deals = [];       // Fetched from Supabase, maintained in memory
let orders = [];      // Fetched from Supabase, maintained in memory
let customers = [];   // Fetched from Supabase, maintained in memory
let notifications = [];  // In-memory notification feed
let selectedProductImageBlob = null;   // Pending image upload for products
let selectedDealImageBlob = null;      // Pending image upload for deals
```

### Initialization Sequence
```
1. DOMContentLoaded fires
2. dbClient.auth.getSession() → check for existing session
3a. If session valid: show app, call initApp()
3b. If no session: show login screen
4. initApp():
   a. Fetch products from Supabase
   b. Fetch deals from Supabase
   c. Fetch customers from Supabase
   d. Fetch orders (with customer join) from Supabase
   e. renderProducts(), renderDeals(), renderOrders(), renderCustomers()
   f. renderDashOrders(), renderAnalytics()
   g. Calculate and render dashboard stats
```

### Modal System
All modals share a common open/close API:

```javascript
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.classList.add('flex');
  setTimeout(() => {
    el.querySelector('.modal-content')?.classList.add('scale-100', 'opacity-100');
    el.querySelector('.modal-content')?.classList.remove('scale-95', 'opacity-0');
  }, 10);
}

function closeModal(id) { /* reverse animation */ }
```

---

## Data Flow Diagrams

### Customer Purchase Flow

```
Customer visits homepage
         │
         ▼
IntersectionObserver triggers
fetchProducts() + fetchDeals()
         │
         ▼
Check sessionStorage cache (5 min TTL)
    ├── CACHE HIT → render cached data
    └── CACHE MISS → Supabase SELECT → render + cache
         │
         ▼
Customer clicks "QUICK VIEW"
         │
         ▼
Product Quick View Modal
  Select size → "ADD TO CART"
         │
         ▼
cart[] updated → localStorage.setItem()
         │
         ▼
Customer clicks "CHECKOUT"
         │
         ▼
Checkout Modal (form)
First Name, Last Name, Email, Phone, Address
         │
         ▼
processCheckout()
  1. SELECT customers WHERE email = ?
     ├── EXISTS → use customerId
     └── NOT EXISTS → INSERT customers → get customerId
  2. Validate deals (if any in cart)
     SELECT deals WHERE id IN (dealIds) AND is_active = true
  3. INSERT orders { customer_id, total_amount, status: 'Pending' }
  4. INSERT order_items[] (product_id, size, qty, price_at_purchase)
  5. sendOrderNotification()
     ├── Fetch Supabase Edge Function (Resend)
     └── Fallback: EmailJS.send()
  6. Clear cart → success toast
```

### Admin Product Save Flow

```
Admin clicks "ADD PRODUCT" or "EDIT (pencil)"
         │
         ▼
openProductModal(id?)
  If id: pre-fill form from products[] array
  If null: empty form
         │
         ▼
Admin fills form, selects image
         │
         ▼
handleProductImageFile(input)
  → processImage(file)
      - Type check, size check
      - canvas.drawImage() at max 1400px
      - canvas.toBlob() → WebP 80%
  → selectedProductImageBlob = blob
  → setProductImagePreview(dataUrl)
         │
         ▼
Admin clicks "SAVE PRODUCT"
         │
         ▼
saveProduct(event)
  If selectedProductImageBlob:
    1. storage.upload(filename, blob) → track progress
    2. storage.getPublicUrl(filename) → img_url
  Else: reuse existing img_url
  
  If id exists:
    UPDATE products SET ... WHERE id = ?
  Else:
    INSERT products { id: Date.now(), ...fields }
  
  Refresh: SELECT products → update products[]
  clearStorefrontCache() → remove sessionStorage keys
  closeModal('product-modal')
  renderProducts()
```

### Email Notification Flow

```
processCheckout() calls sendOrderNotification(order, customerData, cart, total)
         │
         ▼
Build emailPayload:
  orderData = {
    order_id, customer_name, email, phone, address,
    total_amount, payment_method, items[], notes
  }
         │
         ▼
  [Try] fetch POST to Supabase Edge Function
    URL: https://aigyflxgtbkwhlhkdznd.supabase.co/functions/v1/send-order-email
    Body: { orderData }
         │
    Edge Function (Deno):
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: OWNER_EMAIL (secret),
        template: { id, variables }
      })
         │
    On success → email_status = 'sent', email_provider = 'resend'
         │
  [Catch] if Resend fails →
    emailjs.send(serviceId, templateId, {
      order_id, customer_name, customer_email,
      customer_phone, customer_address,
      total_amount, order_summary_html
    })
    On success → email_status = 'sent_fallback', email_provider = 'emailjs'
    On failure → email_status = 'failed'
         │
         ▼
  Update orders SET email_status, email_provider WHERE id = order.id
```

---

## Cache Strategy

```
                    ┌─────────────────┐
                    │  sessionStorage  │
                    │                 │
                    │  mk_products    │──── 5 min TTL
                    │  mk_deals       │──── 5 min TTL
                    └────────┬────────┘
                             │
                     Cache HIT?
                      /       \
                   YES         NO
                    │           │
              Render from    Fetch from Supabase
              cache          → Store in cache
                             → Render
                             
              Admin CRUD?
                   │
         clearStorefrontCache()
                   │
         sessionStorage.removeItem('mk_products')
         sessionStorage.removeItem('mk_deals')
```

---

## Security Architecture

```
Public Internet
      │
      ▼
Vercel CDN (static files)
      │
      ├── Public pages: No auth required
      │
      └── Admin page: JavaScript auth gate
               │
               ▼
         Supabase Auth
         (JWT in localStorage)
               │
               ▼
         All DB operations carry JWT
               │
               ▼
         Supabase RLS policies
         ├── anon: SELECT products, deals
         │         INSERT customers, orders, order_items, subscribers
         └── authenticated: ALL on all tables
```

---

## Deployment Architecture

```
Developer                GitHub                    Vercel
    │                       │                         │
    ├── git push main ──────►├── Webhook triggers ────►├── Build: none
    │                       │                         │   (static files)
    │                       │                         ├── Deploy to CDN
    │                       │                         ├── SSL auto-provisioned
    │                       │                         └── URL live within 60s
    
Supabase CLI              Supabase Platform
    │                         │
    ├── supabase functions ──►├── Edge Function deployed
    │   deploy send-order-   │   to Deno runtime
    │   email                │
    │                        │
    ├── supabase secrets ────►├── RESEND_API_KEY stored
        set                  │   OWNER_EMAIL stored
```
