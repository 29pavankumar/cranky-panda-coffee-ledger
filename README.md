# ☕ Cranky Panda Coffee • POS & Cafe Ledger Dashboard

A specialty coffee retail Point of Sale (POS), espresso bar billing, and roastery inventory management dashboard for **Cranky Panda Coffee**, built to mirror and improve upon the system at **[store-ledger.sockadoodle.shop](https://store-ledger.sockadoodle.shop/)** with custom cafe branding, Supabase cloud sync, offline-first reliability, and a **brand-tailored Cranky Burgundy & Cream theme**.

---

## ⚡ Supabase Cloud Database & Realtime Sync

Your Supabase project is: **`https://ltaeuvjtnimrfxviadqc.supabase.co`**

### Step 1: Create Tables in Supabase
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/ltaeuvjtnimrfxviadqc/sql/new).
2. Copy the contents of [`schema.sql`](schema.sql) and paste into the editor.
3. Click **"Run"**. This automatically creates:
   * `brands` — Multi-tenant brand identity & settings
   * `staff` — Floor staff & cashiers roster
   * `products` — Inventory catalog with floor price, cost price, and stock counts
   * `bills` — Sales transactions with itemized JSON breakdown
   * `stock_adjustments` — Audit trail for storage restocks, recounts & write-offs
   * `cash_drawers` — Daily end-of-day cash reconciliation
   * **Row Level Security (RLS)** policies enabled for anonymous POS devices
   * **Supabase Realtime publication** enabled for instant multi-device sync

### Step 2: Connect the Dashboard
1. Go to **Supabase Dashboard → Project Settings → API**.
2. Copy your **`anon` `public`** API key.
3. Open **`http://localhost:3000`** in your browser.
4. Click the **"Local / Offline"** cloud pill in the header.
5. Paste your `anon` key and click **"Connect & Enable Live Sync"**.
6. The badge turns **🟢 Cloud Live** and syncs your catalog across all devices!

---

## 🎨 Theme System (Bespoke Palettes)

Instead of the fixed emerald-green aesthetic, this dashboard features **5 bespoke themes** that you can switch in 1 click from the header palette menu:

1. **🌌 Obsidian & Electric Violet (Default)**: Deep graphite surface (`#090a10`), royal violet accents, neon badge glows, and luxury dark glassmorphism.
2. **💎 Sapphire Cobalt**: Deep midnight navy surface (`#060b17`), electric blue highlights, precision tech-forward dashboard feel.
3. **🏺 Artisan Terracotta**: Warm espresso charcoal (`#0c0a09`) with artisan terracotta and amber accents, designed for boutique apparel, leather goods, and craft goods.
4. **🌿 Sage & Forest Gold**: Botanical slate with organic sage green (`#10b981`) and warm gold, ideal for sustainable or wellness brands.
5. **☀️ Nordic Studio (Light Mode)**: Ultra-crisp, high-contrast daylight theme designed for outdoor pop-ups, flea markets, and daylight stalls.

---

## 🚀 Quick Start Guide

### Option 1: Run with Python (Recommended)
You can launch the dashboard with zero dependencies:

```bash
cd /Users/pavankumarm/.gemini/antigravity/scratch/store-ledger-dashboard
python3 server.py
```
This serves the application on `http://localhost:3000` and automatically opens your browser.

### Option 2: Open Directly in Browser (100% Offline)
You can simply double-click or open `index.html` in Safari, Chrome, Edge, or Firefox. It runs without an active internet connection.

### Option 3: Deploy to Web
Because this project is a zero-build web app, you can drop the folder straight into **Netlify, Vercel, GitHub Pages, or Hostinger**.

---

## 📦 What's Inside & Feature Breakdown

### 1. 🛍️ POS Book (Point of Sale & Live Billing)
* **Live Catalog Grid**: Fast search by SKU, item name, or material variant.
* **Category & Material Filters**: Switch between custom categories (*Apparel & Socks*, *Stationery*, *Card Games*, *Accessories*, etc.) and subcategory chips (*Organic Cotton*, *Bamboo Fiber*, *Merino Wool*, etc.).
* **Stock Badges**: Real-time stock status (In Stock, Low Stock ≤ 5, Out of Stock).
* **One-Tap Cart & Steppers**: Add products to cart with instant stepper increment/decrement right in the card.
* **Floating Quick-Cart Bar**: Shows item count and running total at all times.
* **Slide-over Checkout Drawer**:
  * Itemized line breakdown with quantities and line totals.
  * Customer details (Customer Name, Phone number, and bill reference).
  * **Cash Payment**: Live cash tendered input with automatic change-to-return calculation.
  * **Dynamic UPI QR Code**: Generates real-time UPI QR codes customized with your brand's UPI VPA and exact bill amount. Customers scan with Google Pay, PhonePe, Paytm, or BHIM.
  * **Card / POS**: Reference input for external card machine auth slips.
  * **Instant Stock Deduction**: Inventory is immediately decremented upon booking.

---

### 2. 🧾 Digital Receipt Generator (Thermal & Canvas PNG)
* **80mm / 58mm Thermal Print Support**: Clean thermal paper slip format compliant with POS receipt printers (`window.print()`).
* **Download PNG Receipt**: Direct client-side HTML5 Canvas rendering that outputs a crisp `.png` image of the bill, ready to be sent to customers via WhatsApp or email.
* Branded with your store name, tagline, contact phone, bill number, date/time, cashier name, customer info, itemized table, total, payment method, and QR.

---

### 3. 📦 Inventory & Stock Ledger
* **Stock Metrics Row**: Total SKUs, Total Units on Floor, Low Stock Alerts, Out of Stock Count, Retail Inventory Valuation, and Cost Valuation.
* **Admin PIN Lock**: Cost prices and profit margins are masked by default (`••••••`). Tap **Unlock Admin PIN** (Default PIN: `1234`) to reveal wholesale costs and profit margins.
* **+ Add Product / SKU**: Modal with SKU auto-generator (`SKU-XXX`), category selector, floor price, cost price, initial stock, and photo/emoji.
* **Adjust Stock & Physical Recount**:
  * Reason tracking: *Brought stock from storage (+)*, *Physical inventory recount (=)*, *Damaged / Defective write-off (-)*, *Customer return (+)*.
  * Adjustments immediately update stock and log to audit state.

---

### 4. 📋 Out Bills / Sales Ledger
* **Search & Filters**: Search past bills by Bill ID (`BILL-XXXX`), customer name, phone, cashier, or SKU. Filter by date (*All Time*, *Today*, *Yesterday*, *This Week*) and payment method (*Cash*, *UPI*, *Card*).
* **Detailed Bill Cards**: Expandable bill cards with cashier name, customer details, payment method badge, and full item breakdown.
* **Re-Print Receipts**: Open or download the digital receipt for any past sale.
* **Void Sale & Return Stock**: Admin PIN protected. Cancelling a bill automatically reverses the sale and returns 100% of the stock back to the catalog.

---

### 5. 📊 Closing & Daily Reconciliation
* **End of Day Stall Closing**:
  * Today's Gross Sales, Total Units Sold, and Bill Count.
  * **Cash in Register**: Real-time sum of all physical cash collected that requires handover.
  * **UPI & Digital Collections**: Total digital bank collections confirmed.
* **Physical Cash Drawer Balancing Tool**:
  * Input starting cash float (e.g. ₹1,000).
  * Auto-adds cash sales.
  * Deducts cash expenses / petty cash payouts.
  * Compares with actual counted cash in drawer to show exact **Match**, **Surplus (+)**, or **Shortage (-)**.
* **Leaderboards**: Top moving products today and floor cashier sales performance.
* **CSV Export**: One-click download of all transaction details into a spreadsheet (`.csv`).
* **Print Closing Sheet**: Formatted end-of-day reconciliation printout for cash handovers.

---

### 6. ⚙️ Brand Identity, Multi-Tenant & Settings
* **Multi-Brand Switcher**: Run multiple brand stalls or separate locations from one place.
* **Brand Settings Console**:
  * Brand Name, Tagline, Phone, Email, Logo Icon / Emoji.
  * Currency Symbol & Code (e.g., `₹ INR`, `$ USD`, `€ EUR`).
  * Custom UPI VPA ID (e.g., `yourbrand@upi`).
  * Custom Admin PIN (replace `1234` with your own secret PIN).
  * Custom Categories list.
* **Data Backup & Restore**:
  * **Download JSON Backup**: Export the entire database (products, bills, staff, settings) as a single JSON file.
  * **Restore Backup**: Load any backup file to restore data on another device or restore after a reset.
  * **Load Demo Catalog**: Reload the pre-filled sample catalog whenever needed.

---

## 📂 Project Directory Structure

```
/Users/pavankumarm/.gemini/antigravity/scratch/store-ledger-dashboard/
├── index.html       # Single-page dashboard application shell
├── styles.css       # Theme variables, glassmorphism, thermal print styles
├── app.js           # Full business logic, POS cart, inventory, ledger, closing
├── server.py        # Lightweight zero-dependency Python server
└── README.md        # Comprehensive documentation
```
