# MK Rockstar — Client Handover Guide

> **For:** Store Owner  
> **Purpose:** A plain-English guide to managing your MK Rockstar website  
> **Version:** v1.0.0

---

## Website Overview

Your website, **MK Rockstar**, is a luxury streetwear online store available at:

🌐 **https://mkrockstar-testing.vercel.app**

The website has two main parts:

1. **The Customer Store** — the public-facing shop where your customers browse and buy products.
2. **The Admin Panel** — your private control room where you manage products, deals, orders, and customers. Customers cannot access this.

---

## Admin Login

The Admin Panel is your management dashboard. To access it:

1. Open your browser and go to:
   ```
   https://mkrockstar-testing.vercel.app/mk_rockstar_admin_suite/code.html
   ```
2. You will see a login screen with the MK Rockstar logo.
3. Enter your **admin email** and **password**.
4. Click **LOG IN**.

> **Important:** Keep your admin email and password private. Do not share them. If you forget your password, contact your developer to reset it through Supabase.

Once logged in, you will see the **Dashboard** — your store's overview.

---

## Add a Product

To add a new product to your store:

1. Log in to the Admin Panel.
2. In the left sidebar, click **Products**.
3. Click the **ADD PRODUCT** button (top right of the page, or in the sidebar).
4. A form will appear. Fill in:
   - **Product Image** — Click the upload area or drag an image file onto it. You can also tap **TAKE PHOTO** on a phone to use your camera.
   - **Product Name** — The name of the product (e.g. "Oversized Bomber Jacket").
   - **Price (PKR)** — The selling price in Pakistani Rupees.
   - **Stock** — How many units are available.
   - **Category** — Select from: Outerwear, Footwear, Accessories, Tops, Bottoms.
   - **SKU** — Optional product code (e.g. MK-0001).
   - **Description** — A short description of the product.
   - **Mark as New Arrival** — Check this box to show the product in the "New Arrivals" section on the homepage.
5. Click **SAVE PRODUCT**.

The product will immediately appear on the customer storefront.

---

## Edit a Product

1. Go to **Products** in the sidebar.
2. Find the product you want to change.
3. Click the **pencil (edit) icon** on the product card.
4. The same form will open, pre-filled with the current details.
5. Make your changes.
6. Click **SAVE PRODUCT**.

---

## Delete a Product

1. Go to **Products** in the sidebar.
2. Find the product you want to remove.
3. Click the **bin (delete) icon** on the product card.
4. A confirmation popup will appear asking you to confirm.
5. Click **DELETE** to permanently remove the product.

> **Warning:** Deleting a product is permanent and cannot be undone. Any linked deals or order items for that product will also be deleted.

---

## Upload a Product Image

When adding or editing a product, the image upload area supports:

- **Drag & Drop** — Drag an image file from your computer directly onto the dashed box.
- **Click to Browse** — Click the box (or the **CHOOSE FROM PHOTOS** button) to open a file browser.
- **Take Photo** — On a mobile device, tap **TAKE PHOTO** to take a picture directly with your camera.

**Accepted formats:** JPG, PNG, WebP  
**Maximum file size:** 5 MB before compression

The system automatically compresses your image before uploading it to keep your website fast.

---

## Replace a Product Image

1. Open the product for editing (click the pencil icon).
2. Click on the existing product image in the upload area — an edit icon will appear.
3. Click on the image or the **CHOOSE FROM PHOTOS** button to select a new image.
4. The new image will replace the old preview.
5. Click **SAVE PRODUCT**.

To remove the image without replacing it, click the **REMOVE IMAGE** link below the image.

---

## Add a Deal

Deals are special promotions shown on the homepage "Deals" section with a discount percentage.

1. In the sidebar, click **Deals**.
2. Click **ADD DEAL**.
3. Fill in:
   - **Deal Title** — The name of the promotion (e.g. "Summer Blowout").
   - **Description** — A brief description of the deal.
   - **Original Price** — The normal full price.
   - **Deal Price** — The discounted sale price.
   - **Linked Product ID** — Optional. If this deal relates to a specific product, enter its ID.
   - **Deal Image** — Upload an image for the deal card.
   - **Active** — Make sure this checkbox is ticked to show the deal on the storefront.
4. Click **SAVE DEAL**.

---

## Edit a Deal

1. Go to **Deals** in the sidebar.
2. Click the **pencil icon** on the deal card you want to change.
3. Update the details and click **SAVE DEAL**.

---

## Delete a Deal

1. Go to **Deals** in the sidebar.
2. Click the **bin icon** on the deal card.
3. Confirm deletion in the popup by clicking **DELETE**.

---

## Manage Orders

1. Click **Orders** in the sidebar.
2. You will see a list of all customer orders showing:
   - Order ID
   - Customer name
   - Date of order
   - Number of items
   - Total amount (in Rs.)
   - Current status (Pending, Processing, Shipped, Delivered, Cancelled)

**To search for a specific order:** Type the customer name or part of the order ID in the **Search orders** box.

**To filter by status:** Use the **Status** dropdown to show only orders in a specific stage.

---

## Change Order Status

Every order goes through a status lifecycle. To update the status:

1. Go to **Orders**.
2. Find the order and click the **three-dot menu (⋮)** on the right.
3. A small menu appears. Click **UPDATE STATUS**.
4. A popup shows the five status options:
   - **Pending** — Just received, not yet confirmed.
   - **Processing** — Being prepared for dispatch.
   - **Shipped** — Sent out for delivery.
   - **Delivered** — Customer has received the order.
   - **Cancelled** — Order was cancelled.
5. Click the status you want to set. It updates immediately.

---

## Customer Management

1. Click **Customers** in the sidebar.
2. You will see a list of all customers with:
   - Name and initials
   - Email address
   - Number of orders placed
   - Total amount spent
   - Tier (New, Gold, VIP)
   - Date they first ordered

**To search for a customer:** Type their name or email in the search box.

**To view full details:** Click on any customer row to open a detail panel showing their full address, phone number, and order history.

**Customer Tiers:**
- **New** — Spent less than Rs. 15,000
- **Gold** — Spent Rs. 15,000 – Rs. 50,000
- **VIP** — Spent over Rs. 50,000

---

## Mobile Usage

The Admin Panel is fully usable on a mobile phone or tablet.

- A **hamburger menu (☰)** appears at the top of the screen on mobile. Tap it to open the sidebar navigation.
- All tables switch to card-style layouts on small screens for easier reading.
- Product and deal image uploads support the phone camera directly via the **TAKE PHOTO** button.
- All modals, forms, and actions work identically on mobile.

---

## Basic Troubleshooting

| Problem | What to do |
|---------|-----------|
| Cannot log in to admin | Check that your email and password are correct. Contact your developer to reset your Supabase Auth password. |
| Products not showing on storefront after adding | The storefront caches products for 5 minutes. Wait a few minutes and refresh the customer page. Alternatively, open a private/incognito browser window. |
| Image upload fails | Make sure the file is JPG, PNG, or WebP and is under 5 MB. |
| Order not appearing in admin | Refresh the admin page. Orders appear in real time but the dashboard loads on page open. |
| Page loads slowly | This can happen on a slow connection. The website uses lazy loading, so content appears progressively. |
| Deal not showing on homepage | Check that the deal is marked **Active** in the edit form. |

---

## Frequently Asked Questions

**Q: Can customers pay online?**  
A: Currently the website uses **Cash on Delivery** (COD). Online payment integration can be added as a future upgrade.

**Q: How do I get notified of new orders?**  
A: Every time a customer places an order, an email is automatically sent to your registered owner email with the full order details including customer name, address, items, and total.

**Q: Can I add more product categories?**  
A: The current categories are Outerwear, Footwear, Accessories, Tops, and Bottoms. Adding new categories requires a developer to update the code.

**Q: How many products can I have?**  
A: There is no hard limit. The store loads products 24 at a time and customers can click "Load More" to see additional products.

**Q: Can I have multiple admin users?**  
A: Currently there is one admin account. Multiple admin accounts can be set up through Supabase Auth if needed.

**Q: What happens if I accidentally delete a product?**  
A: Deletion is permanent. There is no undo. Always confirm carefully before deleting.

**Q: How do I change my admin password?**  
A: Contact your developer. They can reset your password through the Supabase dashboard.

**Q: Are customer details stored securely?**  
A: Yes. Customer data (name, email, phone, address) is stored in a private Supabase PostgreSQL database. It is not visible to the public, and access is controlled by database security rules.
