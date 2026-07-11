# MK Rockstar — Future Costs

> **Version:** v1.0.0  
> **Date:** July 2026  
> **Currency:** USD (approximate; exchange rates may vary)

---

## Important Distinction

This document separates:

1. **One-Time Development Cost** — the cost to build this website (already paid).
2. **Ongoing Operational Costs** — recurring costs to keep the website running (paid by the client going forward).

---

## One-Time Development Cost

The development of the MK Rockstar website (v1.0.0) was a fixed-price engagement covering:

- Full website design and development (homepage, Shop All, product detail, admin panel)
- Supabase backend setup (database schema, RLS policies, auth, storage, edge functions)
- Email notification system (Resend + EmailJS)
- Image upload and compression pipeline
- Vercel deployment and configuration
- `robots.txt`, `sitemap.xml`, Open Graph/Twitter Card meta tags
- Load testing (50 concurrent users, 0% failure rate)
- Full documentation package (this handover)

**This is a one-time cost. It is not a recurring subscription.**

---

## Current Live Services

The following services are currently in use. All are on **free tiers** at launch:

| Service | Purpose | Current Plan | Monthly Cost |
|---------|---------|--------------|-------------|
| **GitHub** | Source code repository | Free | $0 |
| **Vercel** | Website hosting (CDN) | Free (Hobby) | $0 |
| **Supabase** | Database, auth, storage, edge functions | Free | $0 |
| **Resend** | Order notification emails | Free | $0 |
| **EmailJS** | Email fallback | Free | $0 |

**Total current monthly operational cost: $0**

> **Note:** The domain (`mkrockstar-testing.vercel.app`) is a free Vercel subdomain. If you purchase a custom domain (e.g. `mkrockstar.com`), a domain registration cost will apply.

---

## Ongoing Operational Costs

### Domain Renewal (If Custom Domain Is Purchased)

A custom domain is a standard business investment. It is **not** a development cost.

| Item | Typical Cost | Frequency |
|------|-------------|-----------|
| `.com` domain | $10–$15/year | Annual |
| `.pk` domain | $15–$30/year | Annual |
| `.store` domain | $5–$60/year (varies by registrar) | Annual |

**Recommendation:** Register your domain through Namecheap, GoDaddy, or Cloudflare Registrar.

---

### Optional — Supabase Plan Upgrade

The Supabase **Free Plan** includes:

| Resource | Free Limit |
|----------|-----------|
| Database storage | 500 MB |
| File storage | 1 GB |
| API requests | 500,000/month |
| Bandwidth | 5 GB/month |
| Edge Function invocations | 500,000/month |
| Backups | None (manual only) |

For a small-to-medium volume store (up to several hundred orders/month and ~1,000 products), the free plan is typically sufficient.

If the store grows, consider upgrading to:

| Plan | Cost | Key Additions |
|------|------|--------------|
| **Supabase Pro** | $25/month | 8 GB database, 100 GB storage, 250 GB bandwidth, daily backups, point-in-time recovery |

**This is optional and not required at launch.**

---

### Optional — Vercel Plan Upgrade

The Vercel **Hobby (Free) Plan** includes:

| Resource | Free Limit |
|----------|-----------|
| Bandwidth | 100 GB/month |
| Deployments | Unlimited |
| Edge requests | Unlimited |
| Custom domains | 1 per project |
| Analytics | Not included |
| Team members | 1 |

For a small business website, the free plan is sufficient indefinitely for most traffic levels.

If you need visitor analytics or more team members:

| Plan | Cost | Key Additions |
|------|------|--------------|
| **Vercel Pro** | $20/month/user | Web Analytics, 1 TB bandwidth, DDoS mitigation, team collaboration |

**This is optional and not required at launch.**

---

### Optional — Email Service Upgrade

#### Resend
The **Resend Free Plan** allows:
- 100 emails/day
- 3,000 emails/month

For a small store (< 100 orders/day), this is sufficient.

If the store grows:

| Plan | Cost | Volume |
|------|------|--------|
| Resend Starter | $20/month | 50,000 emails/month |
| Resend Pro | $90/month | 100,000 emails/month |

#### EmailJS
The **EmailJS Free Plan** allows:
- 200 emails/month (as fallback)

Since EmailJS is only the fallback (triggered when Resend fails), the free tier is sufficient even at high order volumes.

---

## Cost Summary Table

| Cost Type | Item | Amount | Frequency |
|-----------|------|--------|-----------|
| **One-Time** | Website Development (v1.0.0) | Agreed price | Once (already completed) |
| **Ongoing — Required** | GitHub | $0 | Free |
| **Ongoing — Required** | Vercel (Hobby) | $0 | Free |
| **Ongoing — Required** | Supabase (Free) | $0 | Free |
| **Ongoing — Required** | Resend (Free) | $0 | Free |
| **Ongoing — Required** | EmailJS (Free) | $0 | Free |
| **Ongoing — Optional** | Custom domain (.com) | ~$12/year | Annual |
| **Ongoing — Optional** | Supabase Pro | $25/month | Monthly (if needed) |
| **Ongoing — Optional** | Vercel Pro | $20/month/user | Monthly (if needed) |
| **Ongoing — Optional** | Resend paid plan | From $20/month | Monthly (if needed) |

---

## When to Upgrade

| Trigger | Recommended Upgrade |
|---------|-------------------|
| Database approaching 400 MB | Supabase Pro |
| Storage approaching 800 MB | Supabase Pro |
| > 100 orders per day | Resend paid plan |
| Need visitor analytics | Vercel Pro |
| Multiple admin team members | Vercel Pro |
| Need automated DB backups | Supabase Pro |
