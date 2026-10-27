# Anjali Spices - Artisanal Indian Spices eCommerce Platform

A full-stack, enterprise-grade Spices eCommerce platform built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **RBAC (Role-Based Access Control)** featuring three distinct user categories: **User (Customer)**, **Admin**, and **Superadmin**.

---

## 🌟 Key Platform Features

### 1. 🛍️ Customer (User) Features
- **Artisanal Visual Catalog**: Discover single-origin spices, hand-ground masalas, and Grade A++ Kashmiri saffron.
- **Scoville & Heat Index Meter**: Visual chili pepper heat gauge (Level 0: Aromatic to Level 4: Fiery Volcano).
- **Comprehensive Multi-Filters**: Filter by category, heat index, price sorting, organic certification, and single-origin estate.
- **Dynamic Weight Variants**: 50g, 100g, 250g, 500g, and 1kg options with dynamic live price recalculation.
- **Rich Product Detail Pages**: High-resolution zoom gallery, flavor notes radar, culinary pairings, farmer harvest story, and verified customer reviews.
- **Interactive Sliding Basket (Cart Drawer)**: Real-time subtotal, free shipping progress bar, promo code validation, and quantity steppers.
- **Checkout & Order Flow**: Multi-option payment simulation (Credit Card, Instant UPI/QR, Cash on Delivery), address validator, and shipping speed selector (Standard Eco vs. Express Aroma-Lock).
- **Order Confirmation & Live Tracking**: Interactive shipment stepper (`Placed` → `Cold Milled & Sealed` → `Dispatched` → `Delivered`), invoice printer, and celebratory confetti.
- **Customer Dashboard (`/account`)**: Order history with live tracking numbers, saved delivery addresses, and wishlist manager.

---

### 2. 🛡️ Admin Portal (`/admin`)
- **Operations Dashboard**: Gross sales KPI, total order volume, active spice catalog count, and real-time low-stock inventory alerts.
- **Spices Catalog CRUD**: Add new spices with rich attributes (heat level, aroma notes, origin country, weight variants, harvest year), edit existing botanicals, delete, and 1-click quick-restock (+50 units).
- **Order Fulfillment & Dispatch**: Filter orders by status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), assign carrier services (DHL, FedEx, USPS), and record waybill tracking numbers.
- **Promotional Coupons Management**: Create percentage or fixed discount promo codes (e.g. `SPICE15`, `FIRSTHARVEST`) with minimum cart totals and usage trackers.
- **Customer Reviews Moderation**: Approve authentic customer reviews, feature verified buyers, or reject inappropriate submissions.

---

### 3. 👑 Superadmin Portal (`/superadmin`)
- **System Governance Dashboard**: Platform-wide metrics including customer count, admin staff count, lifetime platform volume, and system health.
- **User & Role Authority Control (`/superadmin/users`)**:
  - Full table of all platform accounts with order history and lifetime value.
  - Role management: **Promote Customer (`USER`) to `ADMIN`** or **Demote `ADMIN` to `USER`**.
  - Account suspension toggle: Activate or Suspend/Ban accounts.
  - Superadmin protection rules (prevents self-demotion or removal of the last superadmin).
- **Global Store & Financial Settings (`/superadmin/settings`)**:
  - Configure Store Name, Tagline, Currency symbol (`$`, `₹`, `€`, `£`).
  - Set Tax percentage rate (%) and Free Shipping spend threshold ($).
  - Configure standard & priority express shipping fees.
  - Edit announcement banner message and toggle live visibility.
- **Security Audit Trail (`/superadmin/logs`)**:
  - Immutable activity log recording who performed what administrative action, when, and specific change details.
- **Database & Factory Reset Utilities (`/superadmin/database`)**:
  - 1-Click JSON Database export/backup.
  - "Restore Factory Demo Data" button to reset the store to a pristine baseline at any time.

---

## 🔑 Pre-Seeded Accounts & Demo Switcher

The platform includes a **Top Sticky Demo Bar** allowing 1-click switching between all three roles without typing credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Superadmin** | `superadmin@anjalispices.com` | `superadmin123` | Full Master System & User Role Governance |
| **Admin** | `admin@anjalispices.com` | `admin123` | Catalog CRUD, Stock, Orders, Coupons, Reviews |
| **Customer (User)** | `user@anjalispices.com` | `user123` | Browse, Wishlist, Basket, Checkout, Tracking |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS with custom artisanal spice color palette (Saffron golds, Paprika reds, Cardamom greens, Warm Cream)
- **Icons**: Lucide React
- **Auth**: HMAC-SHA256 session token system with HTTP-only cookies and bcryptjs password hashing
- **Persistence**: JSON database store in `data/store.json` locally, with a writable/ephemeral store plus in-memory fallback on serverless platforms
- **Visuals**: Curated high-resolution culinary photography from Unsplash and Shopify CDN

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## ▲ Deploying to Vercel

1. Push the repository to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. Vercel auto-detects Next.js. Keep the defaults:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Add the following environment variables in **Project → Settings → Environment Variables**:
   - `JWT_SECRET` — a long random string used to sign session cookies (required for production security).
   - `DATA_DIR` — optional. Only set this if you mount a persistent writable volume.
4. Deploy.

### Storage on Vercel

Vercel's deployment filesystem is **read-only** and `/tmp` is ephemeral. This app is configured to:

- Write the JSON store to `/tmp/anjali-spices-data` when `VERCEL` is set.
- Fall back to an in-memory copy if no writable path is available, so the site still works instead of crashing.

That means demo data (orders, stock, new users) works, but changes may not persist across cold starts or across multiple serverless instances. For durable production data, replace `src/lib/db.ts` with a hosted database (Vercel Postgres, Neon, Supabase, MongoDB, or Vercel KV) or point `DATA_DIR` at a persistent mounted volume.

### Environment variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```
