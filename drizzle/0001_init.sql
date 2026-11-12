create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  sort_order integer not null
);
--> statement-breakpoint
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id),
  slug text not null unique,
  name text not null,
  description text not null,
  material_type text not null,
  material_note text not null,
  waterproof_note text not null,
  care_note text not null,
  size_chart text not null,
  weight_grams integer not null,
  is_active boolean not null default true,
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
--> statement-breakpoint
create index products_category_idx on products (category_id);
--> statement-breakpoint
create index products_active_idx on products (is_active);
--> statement-breakpoint
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url text not null,
  alt text not null,
  sort_order integer not null
);
--> statement-breakpoint
create index images_product_idx on product_images (product_id, sort_order);
--> statement-breakpoint
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  sku text not null unique,
  size text not null,
  color text not null,
  color_hex text not null,
  price integer not null,
  compare_at_price integer,
  stock integer not null,
  weight_grams integer not null,
  is_active boolean not null default true,
  constraint variants_price_check check (price > 0 and stock >= 0)
);
--> statement-breakpoint
create index variants_product_idx on product_variants (product_id);
--> statement-breakpoint
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint users_role_check check (role in ('admin'))
);
--> statement-breakpoint
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
--> statement-breakpoint
create index sessions_user_idx on sessions (user_id);
--> statement-breakpoint
create table vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null,
  value integer not null,
  min_spend integer not null default 0,
  max_discount integer,
  usage_limit integer,
  used_count integer not null default 0,
  first_order_only boolean not null default false,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  constraint vouchers_type_check check (type in ('percent', 'fixed', 'shipping'))
);
--> statement-breakpoint
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending_payment',
  customer_name text not null,
  phone text not null,
  email text,
  address_line text not null,
  province_name text not null,
  city_name text not null,
  district_name text not null,
  postal_code text not null,
  notes text,
  internal_note text,
  courier_code text not null,
  courier_name text not null,
  service_code text not null,
  service_name text not null,
  shipping_cost integer not null,
  shipping_etd text not null,
  shipping_source text not null,
  subtotal integer not null,
  discount integer not null,
  total integer not null,
  voucher_id uuid references vouchers (id),
  voucher_code text,
  snap_token text,
  pay_token text,
  payment_type text,
  midtrans_transaction_id text,
  paid_at timestamptz,
  resi text,
  shipped_at timestamptz,
  reservation_expires_at timestamptz not null,
  needs_attention boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (status in ('pending_payment','paid','processing','shipped','delivered','cancelled','expired','refunded'))
);
--> statement-breakpoint
create index orders_phone_idx on orders (phone);
--> statement-breakpoint
create index orders_status_idx on orders (status);
--> statement-breakpoint
create index orders_created_idx on orders (created_at);
--> statement-breakpoint
create index orders_paid_idx on orders (paid_at);
--> statement-breakpoint
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id),
  variant_id uuid references product_variants (id),
  product_name text not null,
  sku text not null,
  size text not null,
  color text not null,
  qty integer not null,
  unit_price integer not null,
  weight_grams integer not null,
  constraint order_items_qty_check check (qty > 0)
);
--> statement-breakpoint
create table inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  variant_id uuid not null references product_variants (id),
  qty integer not null,
  status text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint reservations_status_check check (status in ('active','committed','released')),
  constraint reservations_qty_check check (qty > 0)
);
--> statement-breakpoint
create index reservations_order_idx on inventory_reservations (order_id);
--> statement-breakpoint
create index reservations_active_idx on inventory_reservations (variant_id) where status = 'active';
--> statement-breakpoint
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  author_name text not null,
  city text,
  rating integer not null,
  body text not null,
  photos jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  seed_key text unique,
  created_at timestamptz not null default now(),
  constraint reviews_rating_check check (rating between 1 and 5),
  constraint reviews_status_check check (status in ('pending','approved','rejected'))
);
--> statement-breakpoint
create index reviews_product_idx on reviews (product_id, status);
--> statement-breakpoint
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  dedupe_key text not null,
  order_id uuid references orders (id) on delete cascade,
  created_at timestamptz not null default now()
);
--> statement-breakpoint
create unique index webhook_dedupe_idx on webhook_events (provider, dedupe_key);
