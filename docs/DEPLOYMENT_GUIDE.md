# MK Rockstar — Deployment Guide

> **Version:** v1.0.0  
> **Hosting:** Vercel  
> **Backend:** Supabase  
> **Repository:** GitHub

---

## Prerequisites

Before deploying, you will need accounts on:
- [GitHub](https://github.com) — source code repository
- [Vercel](https://vercel.com) — static site hosting
- [Supabase](https://supabase.com) — database, auth, storage, and edge functions
- [Resend](https://resend.com) — transactional email (for order notifications)
- [EmailJS](https://www.emailjs.com) — email fallback

---

## GitHub Setup

### 1. Create Repository
1. Log in to GitHub.
2. Create a new repository (e.g. `mk-rockstar`).
3. Set visibility to **Private** (recommended) or Public.

### 2. Push Project Code
From your local project directory:

```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/mk-rockstar.git
git add .
git commit -m "Initial commit: MK Rockstar v1.0.0"
git branch -M main
git push -u origin main
```

### 3. `.gitignore`
The project already includes a `.gitignore` file. Ensure `node_modules/` is excluded (it is, in the existing file).

---

## Vercel Deployment

### 1. Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New Project**.
3. Select **Import Git Repository**.
4. Find and select your `mk-rockstar` GitHub repository.
5. Click **Import**.

### 2. Configure Project Settings
On the configuration screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other (no framework) |
| **Root Directory** | `./` (the directory containing `index.html`) |
| **Build Command** | *(leave empty)* |
| **Output Directory** | *(leave empty)* |
| **Install Command** | *(leave empty)* |

### 3. Deploy
Click **Deploy**. Vercel will detect the static files and serve them directly.

The deployment URL will be something like:
```
https://mk-rockstar-xyz.vercel.app
```

### 4. Production URL
If you have a custom domain (e.g. `mkrockstar.com`), see the **Domain Connection** section below. Otherwise, your site is live at the Vercel-generated URL.

### 5. Automatic Deployments
Every `git push` to the `main` branch will automatically trigger a new deployment on Vercel.

---

## Environment Configuration

The storefront uses the Supabase `anon` (public) key embedded directly in the HTML source. This is intentional — the anon key is safe to be public because database access is controlled by RLS policies.

For the Supabase Edge Function, secret environment variables are managed through the **Supabase dashboard**, not through Vercel.

### Supabase Edge Function Environment Variables

Set these in your Supabase project dashboard under **Settings → Edge Functions → Secrets**:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key (from resend.com dashboard) |
| `OWNER_EMAIL` | The email address that should receive new order notifications |

---

## Supabase Configuration

### 1. Create Supabase Project
1. Log in to [supabase.com](https://supabase.com).
2. Click **New Project**.
3. Choose your organisation, name the project (e.g. `mk-rockstar`), set a strong database password, and select a region close to your users (e.g. `ap-south-1` for Pakistan).

### 2. Create Database Tables
In the Supabase **SQL Editor**, run the following schema:

```sql
-- Products
CREATE TABLE products (
  id          bigint PRIMARY KEY,
  name        text NOT NULL,
  category    text NOT NULL,
  color       text,
  price       numeric NOT NULL,
  badge       text,
  img_url     text,
  hex_color   text,
  is_new_arrival boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Deals
CREATE TABLE deals (
  id             bigint PRIMARY KEY,
  title          text NOT NULL,
  description    text,
  product_id     bigint REFERENCES products(id),
  original_price numeric NOT NULL,
  deal_price     numeric NOT NULL,
  image_url      text,
  start_date     timestamptz,
  end_date       timestamptz,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  first_name  text,
  last_name   text,
  phone       text,
  address     text,
  created_at  timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    uuid REFERENCES customers(id),
  total_amount   numeric NOT NULL,
  status         text NOT NULL DEFAULT 'Pending',
  is_test_order  boolean,
  created_at     timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES orders(id),
  product_id        bigint REFERENCES products(id),
  size              text NOT NULL DEFAULT 'M',
  quantity          integer NOT NULL DEFAULT 1,
  price_at_purchase numeric NOT NULL
);

-- Subscribers
CREATE TABLE subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 3. Enable Row Level Security (RLS)
Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access (storefront)
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read active deals" ON deals FOR SELECT USING (true);

-- Public insert for checkout
CREATE POLICY "Public can create customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can subscribe" ON subscribers FOR INSERT WITH CHECK (true);

-- Public can look up their own customer record
CREATE POLICY "Public can select customers by email" ON customers FOR SELECT USING (true);

-- Deal validation at checkout
CREATE POLICY "Public can read deals for validation" ON deals FOR SELECT USING (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin can do all on products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do all on deals" ON deals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do all on customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do all on orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do all on order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Create Admin User
1. Go to **Authentication → Users** in the Supabase dashboard.
2. Click **Add User** → **Create new user**.
3. Enter the admin email and a secure password.
4. The user is now active and can log in to the admin panel.

---

## Storage Configuration

### 1. Create Storage Bucket
1. In Supabase, go to **Storage**.
2. Click **New bucket**.
3. Name it `product-images`.
4. Set visibility to **Public** (files must be accessible without auth for the storefront to display them).
5. Click **Create bucket**.

### 2. Bucket RLS Policies
Allow authenticated users to upload and unauthenticated users to read:

```sql
-- Anyone can view files
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Authenticated admin can upload
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Authenticated admin can update/replace
CREATE POLICY "Admin can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

---

## Supabase Edge Function Deployment

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase CLI
```bash
supabase login
```

### 3. Link to Your Project
```bash
supabase link --project-ref aigyflxgtbkwhlhkdznd
```

### 4. Deploy the Edge Function
```bash
supabase functions deploy send-order-email
```

### 5. Set Environment Variables
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set OWNER_EMAIL=your@email.com
```

---

## Domain Connection

### 1. Purchase a Domain
Purchase your domain from a registrar such as Namecheap, GoDaddy, or Google Domains.

### 2. Add Domain to Vercel
1. In your Vercel project, go to **Settings → Domains**.
2. Click **Add Domain**.
3. Enter your domain (e.g. `mkrockstar.com`).

### 3. Update DNS Records
Vercel will show you DNS records to add at your domain registrar:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | Vercel's IP address |
| `CNAME` | `www` | `cname.vercel-dns.com` |

DNS propagation takes 24–48 hours.

### 4. Update Sitemap and Canonical URLs
Once your domain is live, update these files:

- `sitemap.xml` — Replace `mkrockstar-testing.vercel.app` with your real domain in all `<loc>` entries.
- `robots.txt` — Update the `Sitemap:` line to point to your domain.
- All `<link rel="canonical">` tags in each HTML page head.
- All `og:url` meta tags in each HTML page head.

---

## SSL

Vercel provides **automatic SSL certificates** via Let's Encrypt for all projects, including custom domains. No manual configuration is required. The certificate is provisioned automatically when the domain is connected and DNS propagates.

---

## robots.txt

The `robots.txt` file is already configured:

```txt
User-agent: *
Disallow: /mk_rockstar_admin_suite/
Allow: /

Sitemap: https://mkrockstar-testing.vercel.app/sitemap.xml
```

**Key points:**
- The admin panel directory is blocked from all search engine crawlers.
- The public storefront is allowed to be indexed.
- Update the `Sitemap:` URL to your production domain after connecting.

---

## sitemap.xml

The `sitemap.xml` is already configured with three public pages:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mkrockstar-testing.vercel.app/mk_rockstar_home/code.html</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mkrockstar-testing.vercel.app/shop_all_mk_rockstar/code.html</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://mkrockstar-testing.vercel.app/oversized_hoodie_mk_rockstar/code.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Update all URLs to your production domain before going live. Then submit the sitemap URL to **Google Search Console**.

---

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] Homepage loads correctly at production URL
- [ ] Products load from Supabase (check browser console for errors)
- [ ] Deals section shows active deals
- [ ] Cart adds items correctly
- [ ] Checkout form submits and creates an order in Supabase
- [ ] Owner receives email notification for test order
- [ ] Admin panel login works
- [ ] Products can be added, edited, and deleted from admin
- [ ] Images upload to Supabase Storage and display on storefront
- [ ] `robots.txt` accessible at `/robots.txt`
- [ ] `sitemap.xml` accessible at `/sitemap.xml`
- [ ] Admin panel returns 200 status but shows login screen (not blocked)
- [ ] SSL certificate is active (padlock icon in browser)
