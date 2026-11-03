-- ============================================================================
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- Project URL: https://ltaeuvjtnimrfxviadqc.supabase.co
-- Brand Store POS & Inventory Ledger
-- ============================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Brands Table (Multi-tenant store configurations)
create table if not exists public.brands (
  id text primary key,
  name text not null,
  slug text not null,
  tagline text,
  phone text,
  upi_vpa text default 'brand@upi',
  currency text default '₹ INR',
  currency_symbol text default '₹',
  logo_icon text default 'assets/logo.jpg',
  admin_pin text default '1234',
  categories text[] default array['General', 'Merchandise'],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Staff & Cashiers Table
create table if not exists public.staff (
  id text primary key,
  brand_id text references public.brands(id) on delete cascade,
  name text not null,
  role text default 'STAFF',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Products / Inventory Catalog Table
create table if not exists public.products (
  id text primary key,
  brand_id text references public.brands(id) on delete cascade,
  name text not null,
  sku text not null,
  category text not null,
  material text,
  flavour text,
  floor_price numeric(10, 2) not null default 0,
  sale_price numeric(10, 2) not null default 0,
  cost_price numeric(10, 2) default 0,
  stock integer not null default 0,
  photo text,
  barcode text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Out Bills / Sales Transactions Table
create table if not exists public.bills (
  id text primary key,
  brand_id text references public.brands(id) on delete cascade,
  bill_number text not null,
  sold_at timestamp with time zone default timezone('utc'::text, now()) not null,
  booked_by text not null default 'Staff',
  customer_name text,
  customer_phone text,
  payment_method text not null default 'cash',
  payment_ref text,
  note text,
  total_quantity integer not null default 0,
  total_revenue numeric(10, 2) not null default 0,
  total_cost numeric(10, 2) not null default 0,
  total_profit numeric(10, 2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Stock Adjustments Audit Trail
create table if not exists public.stock_adjustments (
  id text primary key,
  brand_id text references public.brands(id) on delete cascade,
  product_id text references public.products(id) on delete cascade,
  previous_stock integer not null,
  new_stock integer not null,
  quantity_change integer not null,
  reason text not null,
  note text,
  adjusted_by text default 'Staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Daily Cash Drawer Reconciliation Table
create table if not exists public.cash_drawers (
  id text primary key,
  brand_id text references public.brands(id) on delete cascade,
  date date not null default current_date,
  opening_float numeric(10, 2) default 1000,
  cash_sales numeric(10, 2) default 0,
  cash_expenses numeric(10, 2) default 0,
  counted_cash numeric(10, 2) default 0,
  variance numeric(10, 2) default 0,
  status text default 'pending',
  closed_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Business Balance Sheet & Non-Sales Transactions
create table if not exists public.business_transactions (
  id text primary key,
  brand_id text references public.brands(id) on delete cascade,
  type text not null, -- 'expense', 'owner_capital', 'other_income'
  category text not null,
  amount numeric(10, 2) not null default 0,
  payment_mode text not null default 'cash',
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  note text,
  recorded_by text default 'Staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.brands enable row level security;
alter table public.staff enable row level security;
alter table public.products enable row level security;
alter table public.bills enable row level security;
alter table public.stock_adjustments enable row level security;
alter table public.cash_drawers enable row level security;
alter table public.business_transactions enable row level security;

-- Allow anon public read and write (for POS kiosks & browser clients with anon key)
create policy "Allow all operations for anon" on public.brands for all using (true) with check (true);
create policy "Allow all operations for anon" on public.staff for all using (true) with check (true);
create policy "Allow all operations for anon" on public.products for all using (true) with check (true);
create policy "Allow all operations for anon" on public.bills for all using (true) with check (true);
create policy "Allow all operations for anon" on public.stock_adjustments for all using (true) with check (true);
create policy "Allow all operations for anon" on public.cash_drawers for all using (true) with check (true);
create policy "Allow all operations for anon" on public.business_transactions for all using (true) with check (true);

-- ============================================================================
-- 10. REALTIME PUBLICATION
-- Enables live sync between cashiers, iPads, and phones
-- ============================================================================
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.bills;
alter publication supabase_realtime add table public.brands;
alter publication supabase_realtime add table public.stock_adjustments;
alter publication supabase_realtime add table public.business_transactions;

-- ============================================================================
-- 10. INITIAL SEED DATA (CRANKY PANDA COFFEE)
-- ============================================================================
insert into public.brands (id, name, slug, tagline, phone, upi_vpa, currency, currency_symbol, logo_icon, admin_pin, categories)
values 
  ('brand-1', 'Cranky Panda Coffee', 'cranky-panda', 'Artisan Coffee Roasters • Espresso Bar & Cafe Ledger', '+91 98765 43210', 'crankypanda@upi', '₹ INR', '₹', 'assets/logo.jpg', '1234', array['Espresso & Hot Brews', 'Cold Brew & Iced', 'Coffee Beans (Bags)', 'Bakery & Bites', 'Specialty Beverages']),
  ('brand-2', 'Atelier Roastery & Bakery', 'atelier-roasters', 'Specialty Micro-Lot Coffee & Sourdough', '+91 91234 56789', 'atelier@upi', '₹ INR', '₹', '☕', '1234', array['Pour Over & Manual', 'Espresso', 'Whole Beans', 'Artisan Bakes'])
on conflict (id) do update set 
  name = excluded.name,
  tagline = excluded.tagline,
  logo_icon = excluded.logo_icon,
  categories = excluded.categories;

insert into public.staff (id, brand_id, name, role)
values
  ('staff-1', 'brand-1', 'Pavan Kumar', 'Head Barista'),
  ('staff-2', 'brand-1', 'Kavya R.', 'Cafe Cashier'),
  ('staff-3', 'brand-1', 'Arjun M.', 'Floor Staff')
on conflict (id) do nothing;

insert into public.products (id, brand_id, name, sku, category, material, floor_price, cost_price, stock, photo, barcode)
values
  ('prod-1', 'brand-1', 'Signature Cranky Cold Brew', 'CB-CRK-01', 'Cold Brew & Iced', '18h Slow Steep', 260, 55, 45, '🧊', '890123456801'),
  ('prod-2', 'brand-1', 'Velvet Spanish Latte', 'LAT-SPN-02', 'Espresso & Hot Brews', 'Condensed Milk + Double Shot', 240, 50, 80, '☕', '890123456802'),
  ('prod-3', 'brand-1', 'Artisan Flat White', 'ESP-FLT-03', 'Espresso & Hot Brews', 'Micro-Foam Oat Milk', 220, 45, 95, '☕', '890123456803'),
  ('prod-4', 'brand-1', 'Iced Cranky Cold Foam Latte', 'LAT-CFM-04', 'Cold Brew & Iced', 'Vanilla Cream Foam', 280, 65, 55, '🥤', '890123456804'),
  ('prod-5', 'brand-1', 'Cranky Dark Roast Beans (250g)', 'BAG-DRK-05', 'Coffee Beans (Bags)', 'Whole Bean', 550, 210, 24, '🫘', '890123456805'),
  ('prod-6', 'brand-1', 'Ethiopian Yirgacheffe Single Origin (250g)', 'BAG-ETH-06', 'Coffee Beans (Bags)', 'Filter / Pour-Over Grind', 650, 260, 16, '🫘', '890123456806'),
  ('prod-7', 'brand-1', 'Butter Flaky Croissant', 'BAK-CRS-07', 'Bakery & Bites', 'French Butter', 160, 48, 28, '🥐', '890123456807'),
  ('prod-8', 'brand-1', 'Dark Chocolate Pain au Chocolat', 'BAK-PAC-08', 'Bakery & Bites', '70% Dark Callebaut', 190, 60, 14, '🥖', '890123456808'),
  ('prod-9', 'brand-1', 'Japanese Ceremonial Matcha Latte', 'SPC-MTC-09', 'Specialty Beverages', 'Uji Matcha + Oat', 270, 70, 35, '🍵', '890123456809'),
  ('prod-10', 'brand-1', 'Cranky Espresso Brownie', 'BAK-BRW-10', 'Bakery & Bites', 'Fudge + Espresso Glaze', 150, 42, 5, '🍫', '890123456810')
on conflict (id) do nothing;
