# MK Rockstar — Maintenance Guide

> **Audience:** Store owner and technical maintainer  
> **Version:** v1.0.0

---

## Overview

This guide explains how to maintain the MK Rockstar website after launch. The website is designed for low-maintenance operation. The store owner can manage products, deals, and orders through the admin panel without any developer involvement. Technical maintenance tasks are minimal and are described below.

---

## Updating Products

### Adding a New Product
Follow the steps in [CLIENT_HANDOVER.md](./CLIENT_HANDOVER.md) → **Add a Product**.

**Best practices:**
- Always upload a product image. Products without images appear with a greyed-out placeholder.
- Keep product names consistent with your brand voice.
- Use clear, square-cropped or portrait-aspect (3:4) images for the best visual result.
- Mark seasonal or newly launched items as **New Arrival** to feature them on the homepage.

### Updating a Product Price
1. Go to Admin → Products.
2. Click the pencil icon on the product.
3. Update the **Price (PKR)** field.
4. Click **SAVE PRODUCT**.

> **Important:** Price changes do not retroactively affect existing orders. `order_items.price_at_purchase` is frozen at the time of checkout.

### Removing a Discontinued Product
1. Go to Admin → Products.
2. Click the bin icon on the product.
3. Confirm deletion.

> **Warning:** This permanently deletes the product and any linked deals or order item records. Ensure you no longer need historical sales data for that product before deleting.

---

## Updating Deals

### Activating / Deactivating a Deal
To temporarily hide a deal without deleting it:
1. Go to Admin → Deals.
2. Click the pencil icon on the deal.
3. Uncheck the **ACTIVE** checkbox.
4. Click **SAVE DEAL**.

The deal will disappear from the storefront immediately (cache clears within 5 minutes or on next storefront visit in a new browser session).

### Changing Deal Prices
1. Go to Admin → Deals.
2. Click the pencil icon.
3. Update **Original Price** and/or **Deal Price**.
4. Click **SAVE DEAL**.

The discount percentage shown on the deal card is calculated automatically from the two price fields.

---

## Backups

### Database Backups
Supabase provides **automatic daily backups** on paid plans. On the free plan, point-in-time recovery is not available.

**Recommended backup practice:**
1. Log in to Supabase dashboard.
2. Go to **Settings → Database → Backups**.
3. Download a manual backup periodically (weekly or before major changes).

Alternatively, you can export data as CSV:
1. Go to **Table Editor** in Supabase.
2. Open each table and use the **Export as CSV** option.

**Critical tables to back up regularly:**
- `products` — Your entire catalogue
- `customers` — Customer records
- `orders` — Order history
- `order_items` — Line item history
- `deals` — Promotions

### Code Backups
The code is backed up via **GitHub**. Every `git push` to `main` creates a new snapshot. Vercel also retains all previous deployment versions and you can roll back to any previous deployment from the Vercel dashboard.

---

## Storage Management

Product and deal images are stored in the **Supabase Storage** `product-images` bucket.

### Viewing Storage Usage
1. In Supabase, go to **Storage**.
2. Click on `product-images`.
3. You can see all uploaded files and total storage used.

### Cleaning Up Old Images
When you delete a product or deal from the admin panel, the database record is removed but the **image file in Storage is NOT automatically deleted**. Orphaned image files accumulate over time.

To manually clean up:
1. Go to **Supabase → Storage → product-images**.
2. Identify files that are no longer referenced by any product or deal.
3. Select and delete them.

**Supabase Free Plan storage limit:** 1 GB. With the compression pipeline (WebP @ 80%, max 1400 px), each image is typically 100–350 KB, allowing 3,000–10,000 images before hitting the limit.

---

## Monitoring

### Supabase Dashboard
Monitor database health at: **Supabase → Settings → Usage**

Key metrics to watch:
- **Database rows:** Supabase free tier allows 500 MB database storage.
- **Storage:** Monitor the `product-images` bucket total size.
- **API requests:** Free plan allows 500K requests/month.
- **Edge Function invocations:** Free plan allows 500K/month.

### Vercel Dashboard
Monitor deployment health at: **Vercel → Deployments**

- Check that the latest deployment is "Ready" (green).
- Review **Analytics** (available on paid plans) for visitor metrics.

### Email Delivery
Monitor Resend email delivery at: **resend.com → Emails**

Check:
- Delivery rate for order notification emails.
- Any bounced or failed deliveries.
- Daily/monthly sending volume vs. free plan limit (100 emails/day on Resend free plan).

---

## Database Growth

### Expected Growth Rates

| Table | Growth rate | Notes |
|-------|------------|-------|
| `products` | Slow | Manual additions only |
| `deals` | Slow | Manual additions only |
| `customers` | Medium | 1 row per unique email at checkout |
| `orders` | Medium | 1 row per completed checkout |
| `order_items` | Medium-High | Multiple rows per order |
| `subscribers` | Slow-Medium | Newsletter signups |

### When to Upgrade Supabase Plan
Consider upgrading to the **Supabase Pro Plan** ($25/month) when:
- Database size approaches 400 MB (80% of 500 MB free limit).
- API requests approach 400K/month.
- You need automatic backups with point-in-time recovery.
- You need higher function invocation limits.

---

## Image Management

### Best Practices for New Images
- **Dimensions:** Portrait aspect ratio (3:4 is ideal for product cards, e.g. 1050×1400 px).
- **Format:** JPG, PNG, or WebP. The system will compress and convert to WebP automatically.
- **Source file size:** Keep under 5 MB (the upload validator enforces this).
- **Content:** Clear, well-lit product images on a plain or lifestyle background.

### Image Cache
Product images are served from Supabase Storage via CDN. New images appear immediately after upload. Browser clients may cache images for a few minutes based on CDN headers.

---

## Future Upgrades

The following enhancements can be added by a developer in future phases:

### High Priority
| Upgrade | Description |
|---------|-------------|
| **Online Payment** | Integrate a payment gateway (Stripe, Easypaisa, JazzCash) for card/mobile payments instead of COD |
| **Order Email to Customer** | Send an automated order confirmation email directly to the customer (currently only the owner receives email) |
| **Order Status Persistence** | Persist order status changes to Supabase DB from the admin panel (v1.0.0 updates UI memory only) |
| **Customer Update on Re-order** | Update `customers` record with latest phone/address on re-order (v1.0.0 reuses existing record without updating) |

### Medium Priority
| Upgrade | Description |
|---------|-------------|
| **Google Analytics** | Add GA4 tracking code to all pages for visitor analytics |
| **WhatsApp Order Notification** | Send WhatsApp message to owner on new order (via Twilio or Meta WhatsApp Business API) |
| **Inventory Tracking** | Real stock counts with low-stock warnings (currently stock is a display-only field) |
| **Customer Accounts** | Allow customers to create accounts and view their order history |
| **Admin Settings Persistence** | Save Settings page changes to database |

### Low Priority / Long Term
| Upgrade | Description |
|---------|-------------|
| **Multiple Product Images** | Support gallery of images per product |
| **Product Variants** | Size/colour variants with separate stock tracking |
| **Discount Codes** | Promo code support at checkout |
| **Review System** | Customer product reviews and ratings |
| **Mobile App** | Progressive Web App (PWA) wrapper or native app |
