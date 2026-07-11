# MK Rockstar | Luxury Streetwear — E-Commerce Website

> **Version:** v1.0.0  
> **Status:** Production Ready  
> **Deployed at:** https://mkrockstar-testing.vercel.app

---

## Project Overview

MK Rockstar is a full-stack luxury streetwear e-commerce website built as a static multi-page application (MPA). It delivers a premium, dark-themed shopping experience for customers and a complete admin control panel for the store owner. The entire frontend is built in vanilla HTML, CSS, and JavaScript — no build step required — and is powered by Supabase as the backend-as-a-service (BaaS) provider for the database, authentication, storage, and edge functions.

The site covers the complete customer journey: browsing collections, filtering by category, viewing product quick modals, adding to cart, wishlisting, and checking out. On placement of an order, an automated email notification is sent to the store owner via a Supabase Edge Function calling the Resend API, with EmailJS as a fallback provider.

---

## Features

### Customer-Facing Storefront
- Full-screen hero with animated scroll indicator
- Category filter tabs (All, Hoodies, Jackets, T-Shirts, Bottoms)
- Paginated product grid (24 products per page) with skeleton loading states
- Product quick-view modal with size selector (XS → XXL)
- Wishlist with persistent state (session-based Set)
- Shopping cart drawer with quantity adjustments (persisted in localStorage)
- Deals section with live discount percentage calculation
- Deal quick-view modal with deal-to-cart support
- Checkout modal capturing name, email, phone, address
- Newsletter subscription (saved to Supabase `subscribers` table)
- Scroll-reveal animations on content sections
- Glassmorphism navigation bar with scroll-based transparency
- Mobile responsive layout with slide-out navigation drawer
- Shop All page with sidebar category filters and price sort
- Individual product detail page (Oversized Hoodie)
- Privacy Policy, Terms of Service, and Shipping & Returns modals
- Instagram and TikTok social links in footer
- Open Graph and Twitter Card meta tags for social sharing
- `sitemap.xml` with all public pages
- `robots.txt` blocking the admin directory from crawlers

### Admin Panel (Password Protected)
- Supabase Auth email/password login with session persistence
- Dashboard with live stats: Total Sales, Total Orders, Pending Orders
- Revenue analytics bar chart (Monthly / Quarterly toggle)
- Category breakdown chart (Outerwear, Footwear, Accessories, Tops, Bottoms)
- Recent orders table on dashboard
- Products page: full CRUD — Add, Edit, Delete products with image upload
- Deals page: full CRUD — Add, Edit, Delete deals with image upload
- Orders page: searchable, filterable orders table with status management
- Order status workflow: Pending → Processing → Shipped → Delivered / Cancelled
- Customers CRM: searchable customer table with tier classification (New / Gold / VIP)
- Customer detail modal showing email, phone, address, order count, and total spent
- Analytics page with monthly performance chart and top products table
- Settings page: Store Profile, Notification toggles
- Image upload: drag-and-drop or click-to-upload, with browser-side WebP compression
- Camera capture support on mobile (Take Photo button)
- Notifications panel with per-notification read tracking
- Toast notification system for all user actions
- Dev tool: Delete Test Orders button (visible only at `?devtools=1`)
- Session cache invalidation on every product/deal mutation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript (ES2020+) |
| CSS Framework | Tailwind CSS v4 (via CDN) |
| Typography | Anton (headlines), Hanken Grotesk (body) — Google Fonts |
| Icons | Google Material Symbols Outlined |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (email + password) |
| File Storage | Supabase Storage (`product-images` bucket) |
| Edge Functions | Supabase Edge Functions (Deno runtime) |
| Email — Primary | Resend API (via Supabase Edge Function `send-order-email`) |
| Email — Fallback | EmailJS (browser SDK, initialized in homepage) |
| Deployment | Vercel (static hosting) |
| Version Control | GitHub |
| Image Compression | Browser Canvas API (WebP at 0.8 quality, max 1400 px wide) |
| Caching | sessionStorage (5-minute TTL on products and deals) |

---

## Folder Structure

```
stitch_mk_rockstar_luxury_e_commerce/
│
├── index.html                        # Entry point — redirects to /mk_rockstar_home/code.html
├── robots.txt                        # Blocks admin dir from crawlers; Sitemap reference
├── sitemap.xml                       # XML sitemap with 3 public URLs
├── package.json                      # Node deps: @supabase/supabase-js, sharp, jsdom
│
├── mk_rockstar_home/                 # Homepage (main storefront)
│   ├── code.html                     # Full homepage: hero, products, deals, cart, checkout
│   └── screen.png                    # OG image for social sharing
│
├── shop_all_mk_rockstar/             # Shop All page
│   ├── code.html                     # Full catalog with sidebar filters and sort
│   └── screen.png                    # OG image
│
├── oversized_hoodie_mk_rockstar/     # Individual product detail page
│   ├── code.html                     # Product detail page for Oversized Hoodie
│   └── screen.png                    # OG image
│
├── mk_rockstar_admin_suite/          # Admin Panel (password protected)
│   ├── code.html                     # Full admin SPA: dashboard, products, orders, etc.
│   ├── input.css                     # Tailwind source CSS
│   ├── output.css                    # Compiled Tailwind CSS (linked by admin)
│   ├── tailwind.config.js            # Tailwind design tokens for admin
│   └── screen.png                    # Admin screenshot
│
├── mk_rockstar/                      # Design reference directory
│   └── DESIGN.md                     # Original design spec / Stitch design notes
│
├── supabase/
│   └── functions/
│       └── send-order-email/
│           └── index.ts              # Deno edge function: Resend email trigger
│
├── compress_db.js                    # Node utility: batch image compression script
├── migrate_images.js                 # Node utility: image migration helper
├── temp.js                           # Scratch/dev script (not production)
├── test_dom.js                       # DOM testing utility script
│
└── docs/                             # ← This documentation package
    ├── README.md
    ├── CLIENT_HANDOVER.md
    ├── ADMIN_GUIDE.md
    ├── TECHNICAL_DOCUMENTATION.md
    ├── DATABASE_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    ├── MAINTENANCE_GUIDE.md
    ├── TEST_REPORT.md
    ├── SECURITY_REPORT.md
    ├── FUTURE_COSTS.md
    ├── RELEASE_NOTES.md
    ├── CHANGELOG.md
    ├── PROJECT_ARCHITECTURE.md
    └── CLIENT_CHECKLIST.md
```

---

## Installation

This project has no build step for the storefront. It runs as static HTML files.

The only Node dependencies are utility scripts (`compress_db.js`, `migrate_images.js`). To install them:

```bash
npm install
```

Dependencies installed:
- `@supabase/supabase-js` — Supabase client library
- `sharp` — Image processing for batch compression utility
- `jsdom` — DOM simulation for test utility scripts

---

## Running Locally

Since the project is static HTML, you can serve it with any local HTTP server.

**Option 1 — VS Code Live Server extension:**  
Open the workspace folder in VS Code, right-click `index.html` → "Open with Live Server".

**Option 2 — Python (no install required):**
```bash
cd stitch_mk_rockstar_luxury_e_commerce
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

**Option 3 — Node `http-server`:**
```bash
npx http-server . -p 8080
```

The root `index.html` auto-redirects to `mk_rockstar_home/code.html`, so the homepage will load automatically.

> **Note:** The Supabase `anon` key is embedded in the HTML source. This is expected for a public storefront client — Row Level Security (RLS) on the database enforces access control server-side.

---

## Deployment

The project is deployed on **Vercel** as a static site.

1. Push the repository to GitHub.
2. Connect the GitHub repo to a Vercel project.
3. Set the **Root Directory** to the workspace root (where `index.html` lives).
4. No build command is needed — Vercel serves the static files directly.
5. The Supabase Edge Function (`send-order-email`) is deployed separately via the Supabase CLI.

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full step-by-step instructions.

---

## Project Architecture

```
Browser (Customer / Admin)
        │
        ├── Static HTML/CSS/JS (Vercel CDN)
        │         │
        │         ├── Supabase JS Client (CDN)
        │         │       │
        │         │       ├── PostgreSQL Database (products, deals, orders, customers, order_items)
        │         │       ├── Supabase Auth (admin login session)
        │         │       └── Supabase Storage (product-images bucket → public CDN URLs)
        │         │
        │         └── Email Notification on Checkout
        │                   │
        │                   ├── Primary: Supabase Edge Function → Resend API
        │                   └── Fallback: EmailJS Browser SDK
        │
        └── Admin Panel
                  │
                  └── Protected by Supabase Auth session gate
```

See [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) for detailed Mermaid diagrams.

---

## Version

**v1.0.0** — Initial production release, July 2026.  
See [RELEASE_NOTES.md](./RELEASE_NOTES.md) and [CHANGELOG.md](./CHANGELOG.md) for details.

---

## Credits

| Role | Name |
|------|------|
| Design & Development | MK Rockstar Development Team |
| UI Framework | Tailwind CSS |
| Backend | Supabase |
| Hosting | Vercel |
| Email | Resend, EmailJS |
| Fonts | Google Fonts (Anton, Hanken Grotesk) |
| Icons | Google Material Symbols |
| Social | Instagram: [@m_k_rockstar](https://www.instagram.com/m_k_rockstar) · TikTok: [@m_k_rockstar](https://www.tiktok.com/@m_k_rockstar) |
