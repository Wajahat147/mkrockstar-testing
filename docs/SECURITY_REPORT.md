# MK Rockstar — Security Report

> **Version:** v1.0.0  
> **Date:** July 2026  
> **Classification:** Internal — Handover Document

---

## Executive Summary

The MK Rockstar v1.0.0 website implements layered security using Supabase Row Level Security (RLS) as the primary data protection layer, Supabase Auth for admin authentication, client-side image validation to prevent malicious file uploads, and hardened production error handling. The admin panel is excluded from search engine indexing and protected by an authentication gate.

---

## Row Level Security (RLS)

Row Level Security is enabled on all public-schema tables in the Supabase PostgreSQL database. RLS policies define exactly which operations the `anon` (unauthenticated) role and the `authenticated` (admin) role can perform.

### RLS Policy Summary

| Table | anon SELECT | anon INSERT | anon UPDATE | anon DELETE | auth all |
|-------|-------------|-------------|-------------|-------------|----------|
| `products` | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| `deals` | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| `customers` | ✅ Yes* | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| `orders` | ❌ No | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| `order_items` | ❌ No | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| `subscribers` | ❌ No | ✅ Yes | ❌ No | ❌ No | ✅ Yes |

*`customers` SELECT is allowed for the anon role because checkout must look up an existing customer by email to avoid duplicate records.

**Key security properties:**
- Public users **cannot update or delete** any records.
- Public users **cannot read** orders or order items — this data is admin-only.
- Public users **cannot modify** products or deals.
- All destructive operations (UPDATE, DELETE) require a valid Supabase Auth session.

---

## Authentication

### Admin Authentication
- **Provider:** Supabase Auth (email + password)
- **Method:** `signInWithPassword({ email, password })`
- **Session storage:** JWT stored in browser `localStorage` by the Supabase client library. The JWT is signed with the Supabase project JWT secret and cannot be forged.
- **Token refresh:** Handled automatically by `@supabase/supabase-js`. Sessions expire after the configured timeout and are refreshed transparently.

### Authentication Gate
The admin panel HTML wraps all protected content in:
```html
<div id="app-content" style="display:none;">
```

On page load, `dbClient.auth.getSession()` is awaited. If no valid session exists, the login screen (`#login-screen`) is displayed and `#app-content` remains hidden. There is no client-side bypass for this gate — the `app-content` div requires JavaScript to be made visible, and the session check runs before any content is shown.

**Note:** This is a JavaScript-based protection layer. The HTML files themselves are publicly accessible static files. The actual data security depends entirely on Supabase RLS — an attacker who bypasses the UI gate would still be subject to RLS policies that deny write and admin-level read access without a valid JWT.

### Search Engine Exclusion
The admin panel includes:
```html
<meta name="robots" content="noindex, nofollow" />
```

And `robots.txt` blocks crawlers at the directory level:
```txt
Disallow: /mk_rockstar_admin_suite/
```

This prevents the admin URL from appearing in search results.

---

## Image Validation

Client-side validation is performed in `processImage()` before any upload reaches Supabase Storage:

### File Type Validation
```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
if (!allowedTypes.includes(file.type)) {
  showToast('Invalid file type. Only JPG, PNG, and WebP are accepted.', 'error');
  reject(new Error('Invalid file type'));
  return;
}
```
Only JPEG, PNG, and WebP files are accepted. Any other MIME type is rejected before the upload is initiated.

### File Size Validation
```javascript
if (file.size > 5 * 1024 * 1024) {
  showToast('File is too large. Maximum size allowed before compression is 5 MB.', 'error');
  reject(new Error('File too large'));
  return;
}
```
Files larger than 5 MB are rejected before processing.

**Limitation:** Client-side validation is a usability control, not a security guarantee. A determined attacker could bypass browser-side validation by making direct API calls. Supabase Storage bucket policies should include MIME type restrictions as a server-side enforcement layer.

---

## Upload Restrictions

### Who Can Upload
Image uploads to the `product-images` Storage bucket require an **authenticated Supabase session**. The Storage bucket RLS policy enforces:

```sql
CREATE POLICY "Admin can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

Unauthenticated requests to upload files to the bucket are rejected by Supabase at the API level.

### Public Read Access
The bucket is set to **public** to allow product images to be served via CDN without authentication. Files in the bucket are accessible to anyone who knows the URL. This is intentional — product images are public-facing content.

---

## Checkout Protection

### Deal Validation
At checkout, if the cart contains deal items, the system performs a server-side validation:

```javascript
const { data: activeDeals } = await dbClient.from('deals')
  .select('id, is_active')
  .in('id', dealIds);

for (const c of cart) {
  if (c.color === 'DEAL' && c.deal_id) {
    const d = activeDeals?.find(x => String(x.id) === String(c.deal_id));
    if (!d || !d.is_active) throw new Error(`The deal "${c.name}" is no longer active.`);
  }
}
```

This prevents a customer from completing a purchase at a deal price if the deal has been deactivated since they added it to their cart.

### No Price Manipulation
Cart prices are stored client-side in `localStorage`. While a technically sophisticated user could modify these values, the `price_at_purchase` stored in `order_items` is taken directly from the JavaScript cart object at the time of submission. There is no server-side price validation in v1.0.0 — a future enhancement should verify prices against the database at checkout time.

### No Duplicate Order Prevention
v1.0.0 does not implement idempotency keys or duplicate order detection. Rapid re-submission of the checkout form (e.g., clicking "PLACE ORDER" twice quickly) could create two orders. The submit button is disabled during processing to mitigate this.

---

## Development Tools

### Load Test Mode
A hidden load test mode is activated via `?loadtest=1` in the URL:
```javascript
let IS_LOAD_TEST_MODE = new URLSearchParams(window.location.search).has('loadtest');
```

When active, checkout uses randomised test emails and marks orders with `is_test_order = true`. This prevents test orders from polluting real customer data.

### Dev Tools Panel
The **DELETE TEST ORDERS** button in the admin Orders page is only visible when `?devtools=1` is in the URL:
```javascript
if (new URLSearchParams(window.location.search).has('devtools')) {
  devBtn.classList.remove('hidden');
}
```

This tool is not shown to normal admin sessions. It is accessible only to someone who knows the URL parameter.

---

## Production Cleanup

Before final production deployment, the following items should be verified:

- [ ] No `console.log` statements with sensitive data in the storefront pages
- [ ] Load test mode (`?loadtest=1`) is not referenced in any public documentation
- [ ] Dev tools mode (`?devtools=1`) is known only to the developer
- [ ] All test orders (`is_test_order = true`) have been deleted from the database
- [ ] `robots.txt` is correctly blocking `/mk_rockstar_admin_suite/`
- [ ] Admin panel `noindex` meta tag is present
- [ ] Supabase Edge Function secrets (`RESEND_API_KEY`, `OWNER_EMAIL`) are set via Supabase dashboard (not hardcoded)
- [ ] No sensitive credentials are in the GitHub repository (the Supabase anon key is acceptable; service role keys must not be committed)

---

## Security Recommendations

The following improvements are recommended for future versions:

| Priority | Recommendation |
|----------|---------------|
| High | Persist order status changes to Supabase DB (currently UI-only), so the audit trail is tamper-evident |
| High | Add server-side price validation at checkout — verify `price_at_purchase` against current `products.price` |
| Medium | Add Supabase Storage MIME-type restriction via bucket policies for server-side file type enforcement |
| Medium | Implement idempotency keys on checkout to prevent duplicate orders from rapid re-submission |
| Medium | Rate-limit the checkout API using Supabase Edge Function middleware or a WAF |
| Medium | Rotate the Supabase anon key periodically (requires updating the key in all HTML source files and redeploying) |
| Low | Add CAPTCHA or honeypot to newsletter and checkout forms to prevent bot submissions |
| Low | Implement Content Security Policy (CSP) headers via Vercel `vercel.json` configuration |
| Low | Consider server-side rendering or server-side auth for the admin panel to provide true route protection |
