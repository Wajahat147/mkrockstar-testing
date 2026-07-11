# MK Rockstar — Client Checklist

> **Date of Handover:** July 2026  
> **Version Delivered:** v1.0.0  
> **Website URL:** https://mkrockstar-testing.vercel.app

---

## Instructions

This checklist is for the client to work through after receiving the handover. Complete each item in order. Items marked **[DEVELOPER]** require your developer's help. Items marked **[CLIENT]** you can complete on your own.

Mark each checkbox when done.

---

## Section 1 — Access & Credentials

| # | Action | Who | Done |
|---|--------|-----|------|
| 1.1 | Receive your admin email and password from your developer | [DEVELOPER] | ☐ |
| 1.2 | Log in to the Admin Panel at the admin URL provided | [CLIENT] | ☐ |
| 1.3 | Confirm you can see the Dashboard | [CLIENT] | ☐ |
| 1.4 | Receive access to the Supabase dashboard (if needed for advanced management) | [DEVELOPER] | ☐ |
| 1.5 | Receive access to the Vercel dashboard (to monitor deployments) | [DEVELOPER] | ☐ |
| 1.6 | Receive access to the GitHub repository (for code reference/backup) | [DEVELOPER] | ☐ |
| 1.7 | Receive the Resend API dashboard access (to monitor email delivery) | [DEVELOPER] | ☐ |

---

## Section 2 — Website Review

| # | Action | Who | Done |
|---|--------|-----|------|
| 2.1 | Open the homepage on desktop and confirm all sections look correct | [CLIENT] | ☐ |
| 2.2 | Open the homepage on your mobile phone and confirm layout looks good | [CLIENT] | ☐ |
| 2.3 | Confirm products are loading from the database (not placeholder items) | [CLIENT] | ☐ |
| 2.4 | Confirm deals section shows the correct active deals | [CLIENT] | ☐ |
| 2.5 | Click each category filter tab (Hoodies, T-Shirts, etc.) and confirm filtering works | [CLIENT] | ☐ |
| 2.6 | Click "QUICK VIEW" on a product and confirm the modal opens correctly | [CLIENT] | ☐ |
| 2.7 | Add an item to cart and confirm cart drawer opens with the correct item | [CLIENT] | ☐ |
| 2.8 | Complete a test checkout with your own details (you will receive the order email) | [CLIENT] | ☐ |
| 2.9 | Confirm you received the order notification email | [CLIENT] | ☐ |
| 2.10 | Log in to Admin → Orders and confirm the test order appears | [CLIENT] | ☐ |
| 2.11 | Delete the test order from the admin panel | [CLIENT] | ☐ |
| 2.12 | Open the Shop All page and confirm it loads products | [CLIENT] | ☐ |
| 2.13 | Confirm the footer social links go to the correct Instagram and TikTok pages | [CLIENT] | ☐ |

---

## Section 3 — Admin Panel Verification

| # | Action | Who | Done |
|---|--------|-----|------|
| 3.1 | Log in to Admin and confirm Dashboard stats load correctly | [CLIENT] | ☐ |
| 3.2 | Go to Products — confirm all your products are listed | [CLIENT] | ☐ |
| 3.3 | Add a test product with an image, confirm it appears on the storefront | [CLIENT] | ☐ |
| 3.4 | Edit the test product's price, confirm the change is visible on the storefront | [CLIENT] | ☐ |
| 3.5 | Delete the test product, confirm it is removed from the storefront | [CLIENT] | ☐ |
| 3.6 | Go to Deals — confirm all active deals are listed | [CLIENT] | ☐ |
| 3.7 | Add a test deal, confirm it appears on the homepage Deals section | [CLIENT] | ☐ |
| 3.8 | Delete the test deal | [CLIENT] | ☐ |
| 3.9 | Go to Orders — confirm all historical orders appear | [CLIENT] | ☐ |
| 3.10 | Update an order status from Pending to Processing, confirm the badge changes | [CLIENT] | ☐ |
| 3.11 | Go to Customers — confirm customer records are present | [CLIENT] | ☐ |
| 3.12 | Click on a customer to confirm the detail modal shows name, email, phone, address | [CLIENT] | ☐ |
| 3.13 | Confirm the Admin Panel works correctly on your mobile phone | [CLIENT] | ☐ |

---

## Section 4 — Domain & Branding (If Custom Domain Required)

| # | Action | Who | Done |
|---|--------|-----|------|
| 4.1 | Decide on a domain name (e.g. `mkrockstar.com`) | [CLIENT] | ☐ |
| 4.2 | Purchase the domain from a registrar (Namecheap, GoDaddy, etc.) | [CLIENT] | ☐ |
| 4.3 | Share domain registrar login with developer to update DNS settings | [DEVELOPER] | ☐ |
| 4.4 | Connect domain to Vercel project | [DEVELOPER] | ☐ |
| 4.5 | Wait 24–48 hours for DNS propagation | [CLIENT] | ☐ |
| 4.6 | Confirm website is accessible at the new domain with padlock (HTTPS) | [CLIENT] | ☐ |
| 4.7 | Update `sitemap.xml` and canonical links to use new domain | [DEVELOPER] | ☐ |
| 4.8 | Submit sitemap to Google Search Console for SEO indexing | [DEVELOPER] | ☐ |

---

## Section 5 — Email Configuration Confirmation

| # | Action | Who | Done |
|---|--------|-----|------|
| 5.1 | Confirm the email address receiving order notifications is correct | [CLIENT] | ☐ |
| 5.2 | Check your spam/junk folder if order emails are not appearing in inbox | [CLIENT] | ☐ |
| 5.3 | Mark the sender address (Resend / EmailJS) as "Not Spam" or "Safe Sender" | [CLIENT] | ☐ |
| 5.4 | If order emails need to go to a different address, inform your developer | [DEVELOPER] | ☐ |

---

## Section 6 — Supabase Plan Review

| # | Action | Who | Done |
|---|--------|-----|------|
| 6.1 | Log in to Supabase dashboard (if access has been provided) | [CLIENT] | ☐ |
| 6.2 | Go to Settings → Usage and confirm current usage is within free tier limits | [CLIENT] | ☐ |
| 6.3 | Note the free plan limits (500 MB DB, 1 GB Storage, 500K API requests/month) | [CLIENT] | ☐ |
| 6.4 | Download a manual data backup (Table Editor → Export CSV) for safe-keeping | [CLIENT] | ☐ |

---

## Section 7 — Content Review

| # | Action | Who | Done |
|---|--------|-----|------|
| 7.1 | Review all product names and prices — request corrections from developer if needed | [CLIENT/DEVELOPER] | ☐ |
| 7.2 | Review all deals — confirm titles, prices, and active status are correct | [CLIENT] | ☐ |
| 7.3 | Review the Privacy Policy modal content — request changes if needed | [CLIENT/DEVELOPER] | ☐ |
| 7.4 | Review the Terms of Service modal content | [CLIENT/DEVELOPER] | ☐ |
| 7.5 | Review the Shipping & Returns modal content | [CLIENT/DEVELOPER] | ☐ |
| 7.6 | Confirm the social media links (Instagram, TikTok) in the footer go to the correct accounts | [CLIENT] | ☐ |

---

## Section 8 — Handover Sign-Off

| # | Confirmation | Client Initials |
|---|--------------|-----------------|
| 8.1 | I have received access to the Admin Panel | |
| 8.2 | I have successfully logged in and verified the website is functioning | |
| 8.3 | I have received and reviewed all documentation in the `/docs` folder | |
| 8.4 | I understand how to add, edit, and delete products and deals | |
| 8.5 | I understand how to manage and update order statuses | |
| 8.6 | I understand the ongoing service costs (currently $0/month) | |
| 8.7 | I accept the website as delivered at version v1.0.0 | |

---

**Client Signature:** _______________________________________

**Date:** _______________________________________

**Developer:** _______________________________________

---

## Quick Reference Card

### Admin Panel URL
```
https://mkrockstar-testing.vercel.app/mk_rockstar_admin_suite/code.html
```

### Support
For any technical issues, contact your developer and provide:
- The error message (screenshot or description)
- What you were trying to do
- What device/browser you were using
- The date and time of the issue
