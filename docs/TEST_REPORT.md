# MK Rockstar — Test Report

> **Version:** v1.0.0  
> **Date:** July 2026  
> **Testing Method:** Manual functional testing + automated load testing

---

## Summary

All functional test cases passed. Load testing confirmed the system handles 50 concurrent users across all critical flows with 0% failed requests.

---

## Functional Testing

### Homepage (`mk_rockstar_home/code.html`)

| Test Case | Description | Result |
|-----------|-------------|--------|
| HP-01 | Page loads within 3 seconds on desktop | ✅ PASS |
| HP-02 | Hero section renders with full-screen background image | ✅ PASS |
| HP-03 | Navigation links scroll to correct sections | ✅ PASS |
| HP-04 | Mobile hamburger menu opens/closes | ✅ PASS |
| HP-05 | Mobile menu links close the menu on tap | ✅ PASS |
| HP-06 | Glassmorphism nav activates on scroll past 60px | ✅ PASS |
| HP-07 | Collection bento grid renders with 4 categories | ✅ PASS |
| HP-08 | Clicking a collection card scrolls to New Arrivals and filters | ✅ PASS |
| HP-09 | Products skeleton loading screen appears before data loads | ✅ PASS |
| HP-10 | Products load from Supabase and render as cards | ✅ PASS |
| HP-11 | Category filter tabs filter products correctly (Hoodies, Jackets, T-Shirts, Bottoms) | ✅ PASS |
| HP-12 | "ALL" filter tab shows all products | ✅ PASS |
| HP-13 | "LOAD MORE" button fetches next 24 products | ✅ PASS |
| HP-14 | "LOAD MORE" button hides when all products are loaded | ✅ PASS |
| HP-15 | Scroll-reveal animation activates on sections entering viewport | ✅ PASS |
| HP-16 | Deals section loads active deals from Supabase | ✅ PASS |
| HP-17 | Discount percentage calculates correctly | ✅ PASS |
| HP-18 | Newsletter email input submits and shows success message | ✅ PASS |
| HP-19 | Newsletter submission saved to `subscribers` table | ✅ PASS |
| HP-20 | Footer social links open correct Instagram and TikTok pages | ✅ PASS |
| HP-21 | Privacy Policy modal opens and closes | ✅ PASS |
| HP-22 | Terms of Service modal opens and closes | ✅ PASS |
| HP-23 | Shipping & Returns modal opens and closes | ✅ PASS |

---

### Products

| Test Case | Description | Result |
|-----------|-------------|--------|
| PR-01 | Product card shows image, name, colour, price | ✅ PASS |
| PR-02 | "QUICK VIEW" button appears on hover | ✅ PASS |
| PR-03 | Quick View modal opens with product image, name, price, size selector | ✅ PASS |
| PR-04 | Size selector: clicking a size highlights it in gold | ✅ PASS |
| PR-05 | "ADD TO CART" from Quick View adds product with selected size | ✅ PASS |
| PR-06 | Default size is M if no size is explicitly selected | ✅ PASS |
| PR-07 | Wishlist heart button toggles filled/unfilled | ✅ PASS |
| PR-08 | Wishlist count badge updates on add/remove | ✅ PASS |
| PR-09 | Wishlist drawer opens and shows wishlisted items | ✅ PASS |
| PR-10 | "VIEW" in wishlist opens Quick View | ✅ PASS |
| PR-11 | "REMOVE" in wishlist removes item and updates count | ✅ PASS |

---

### Deals

| Test Case | Description | Result |
|-----------|-------------|--------|
| DE-01 | Only active deals appear on homepage | ✅ PASS |
| DE-02 | Inactive deals do not appear on storefront | ✅ PASS |
| DE-03 | "GRAB DEAL" opens Quick View modal for the deal | ✅ PASS |
| DE-04 | Deal Quick View shows deal price and strikethrough original price | ✅ PASS |
| DE-05 | "ADD TO CART" from deal Quick View adds deal item to cart | ✅ PASS |
| DE-06 | Deal item appears in cart with deal price | ✅ PASS |
| DE-07 | At checkout, expired/inactive deals are rejected with error message | ✅ PASS |

---

### Checkout

| Test Case | Description | Result |
|-----------|-------------|--------|
| CO-01 | Clicking "CHECKOUT" button in cart drawer opens checkout modal | ✅ PASS |
| CO-02 | Checkout form requires First Name, Last Name, Email, Phone, Address | ✅ PASS |
| CO-03 | Invalid email format prevented by HTML5 validation | ✅ PASS |
| CO-04 | Submit button shows loading spinner during processing | ✅ PASS |
| CO-05 | New customer record created in `customers` table | ✅ PASS |
| CO-06 | Returning customer (same email) reuses existing `customer_id` | ✅ PASS |
| CO-07 | Order row created in `orders` table with status `Pending` | ✅ PASS |
| CO-08 | `order_items` rows created for each cart item | ✅ PASS |
| CO-09 | `price_at_purchase` correctly reflects cart price, not current DB price | ✅ PASS |
| CO-10 | Cart clears after successful checkout | ✅ PASS |
| CO-11 | Success toast displayed after checkout | ✅ PASS |
| CO-12 | Owner receives email notification via Resend | ✅ PASS |
| CO-13 | EmailJS fallback triggers if Resend fails | ✅ PASS |

---

### Emails

| Test Case | Description | Result |
|-----------|-------------|--------|
| EM-01 | Order notification email sent to owner on every checkout | ✅ PASS |
| EM-02 | Email contains correct Order ID | ✅ PASS |
| EM-03 | Email contains customer name, email, phone, address | ✅ PASS |
| EM-04 | Email contains itemised order summary (name, size, colour, qty, price) | ✅ PASS |
| EM-05 | Email contains total order amount | ✅ PASS |
| EM-06 | Email contains payment method (Cash on Delivery) | ✅ PASS |
| EM-07 | EmailJS fallback sends when Resend edge function is unavailable | ✅ PASS |

---

### CRUD (Admin Panel)

| Test Case | Description | Result |
|-----------|-------------|--------|
| CR-01 | Admin login screen shows on unauthenticated visit | ✅ PASS |
| CR-02 | Login with correct credentials grants access | ✅ PASS |
| CR-03 | Login with incorrect credentials shows error toast | ✅ PASS |
| CR-04 | Logout clears session and shows login screen | ✅ PASS |
| CR-05 | Add new product with all fields and image | ✅ PASS |
| CR-06 | Product appears on storefront after add | ✅ PASS |
| CR-07 | Edit product updates name, price, category | ✅ PASS |
| CR-08 | Edit product replaces image and uploads new to Storage | ✅ PASS |
| CR-09 | Delete product removes from DB and storefront | ✅ PASS |
| CR-10 | Delete product cascades to linked deals and order_items | ✅ PASS |
| CR-11 | Add new deal with image and active status | ✅ PASS |
| CR-12 | Deal appears on storefront after add | ✅ PASS |
| CR-13 | Edit deal updates title, prices, active status | ✅ PASS |
| CR-14 | Delete deal removes from DB and storefront | ✅ PASS |
| CR-15 | Orders table loads all orders from Supabase | ✅ PASS |
| CR-16 | Order status update reflected in UI | ✅ PASS |
| CR-17 | Delete order removes order and order_items from DB | ✅ PASS |
| CR-18 | Customers table loads all customers | ✅ PASS |
| CR-19 | Customer detail modal shows correct data | ✅ PASS |
| CR-20 | Image upload drag-and-drop works | ✅ PASS |
| CR-21 | Image compression shows "COMPRESSING IMAGE..." state | ✅ PASS |
| CR-22 | Invalid file type rejected with error toast | ✅ PASS |
| CR-23 | File over 5 MB rejected with error toast | ✅ PASS |
| CR-24 | Storefront cache cleared after admin product/deal changes | ✅ PASS |

---

### Mobile Testing

| Test Case | Device | Result |
|-----------|--------|--------|
| MO-01 | Homepage renders correctly on iPhone 14 (390px) | ✅ PASS |
| MO-02 | Hamburger menu opens/closes correctly | ✅ PASS |
| MO-03 | Products grid shows 2 columns on mobile | ✅ PASS |
| MO-04 | Cart drawer opens full-width on mobile | ✅ PASS |
| MO-05 | Quick View modal opens as bottom sheet on mobile | ✅ PASS |
| MO-06 | Checkout form is fully usable on mobile keyboard | ✅ PASS |
| MO-07 | Admin sidebar off-canvas on mobile (< 1024px) | ✅ PASS |
| MO-08 | Admin orders table shows card layout on mobile | ✅ PASS |
| MO-09 | Admin customers table shows card layout on mobile | ✅ PASS |
| MO-10 | Camera capture (TAKE PHOTO) triggers device camera | ✅ PASS |
| MO-11 | Admin modals are scrollable on small screens | ✅ PASS |

---

### Desktop Testing

| Test Case | Browser | Result |
|-----------|---------|--------|
| DK-01 | Homepage — Chrome 120 | ✅ PASS |
| DK-02 | Homepage — Firefox 120 | ✅ PASS |
| DK-03 | Homepage — Safari 17 | ✅ PASS |
| DK-04 | Admin — Chrome 120 | ✅ PASS |
| DK-05 | Admin — Firefox 120 | ✅ PASS |
| DK-06 | Admin — Safari 17 | ✅ PASS |
| DK-07 | Products grid — 4 columns at 1440px | ✅ PASS |
| DK-08 | Admin sidebar fixed at 256px on desktop | ✅ PASS |

---

## Performance Testing

Load testing was conducted using automated concurrent HTTP requests simulating real checkout flows.

### Test Methodology
- Tool: Automated concurrent request simulation with `?loadtest=1` flag
- Test orders flagged with `is_test_order = true` for easy cleanup
- Test flow: Full checkout (customer upsert → order create → order_items create)
- Concurrent users: 50 simultaneous
- Cleanup: All test orders deleted via admin dev tool after testing

### Results

#### Homepage Load Test

| Metric | Result |
|--------|--------|
| Concurrent users | 50 |
| Failed requests | 0% |
| Status | ✅ PASS |

**Notes:** Supabase products and deals queries handled 50 concurrent SELECT requests without error. Client-side sessionStorage caching reduced total database requests significantly during real-world usage simulation.

---

#### Products API (Supabase REST)

| Metric | Result |
|--------|--------|
| Concurrent users | 50 |
| Failed requests | 0% |
| Status | ✅ PASS |

**Notes:** Paginated product queries (`RANGE 0-23`) completed successfully under concurrent load. No rate limiting triggered on the Supabase free plan during testing.

---

#### Checkout Flow

| Metric | Result |
|--------|--------|
| Concurrent users | 50 |
| Failed requests | 0% |
| Orders created | 50 (all confirmed in Supabase dashboard) |
| Customers created | 50 (unique emails per test run) |
| Order items created | 50+ (all confirmed) |
| Status | ✅ PASS |

**Notes:** All 50 concurrent checkout operations completed successfully. The chunked delete utility successfully removed all test orders in subsequent cleanup runs.

---

## Known Issues at Release

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| KI-01 | Order status changes in admin are not persisted to Supabase DB | Medium | Deferred to v1.1.0 |
| KI-02 | Returning customer address/phone not updated on re-order | Low | Deferred to v1.1.0 |
| KI-03 | Analytics "Top Products" table uses simulated unit sold/revenue data | Low | Deferred to v1.1.0 |
| KI-04 | `image_url` orphaned in Supabase Storage when product is deleted | Low | Deferred to v1.1.0 |
