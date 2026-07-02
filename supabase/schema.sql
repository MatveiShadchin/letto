-- ============================================================
-- Летто — новая база Supabase
-- Supabase Dashboard → SQL Editor → вставить → Run
-- ============================================================

-- Чистая установка (удалит старые данные!)
drop table if exists public.orders cascade;
drop table if exists public.inquiries cascade;
drop table if exists public.products cascade;

-- ── Товары (карточки на сайте) ──────────────────────────────
-- price хранится в копейках: 250000 = 2500 ₽

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  details text,
  price integer not null default 0 check (price >= 0),
  image_url text not null default '',
  category text not null default '',
  stock integer not null default 0 check (stock >= 0),
  is_popular boolean not null default false,
  featured_slot integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);
create index products_featured_slot_idx on public.products (featured_slot) where featured_slot is not null;

-- ── Заявки с сайта (контакты) ─────────────────────────────

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'responded')),
  created_at timestamptz not null default now()
);

create index inquiries_status_idx on public.inquiries (status);
create index inquiries_created_at_idx on public.inquiries (created_at desc);

-- ── Заказы (оформление) ───────────────────────────────────

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  street text,
  house text,
  delivery_method text not null default 'courier' check (delivery_method in ('courier', 'pickup')),
  delivery_time text,
  items jsonb not null default '[]'::jsonb,
  items_total integer not null default 0,
  delivery_cost integer not null default 0,
  total integer not null default 0,
  status text not null default 'new' check (status in ('new', 'processing', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

-- ── Авто-обновление updated_at ──────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ── RLS (доступ для сайта через anon key) ───────────────────

alter table public.products enable row level security;
alter table public.inquiries enable row level security;
alter table public.orders enable row level security;

create policy "products_select" on public.products for select using (true);
create policy "products_insert" on public.products for insert with check (true);
create policy "products_update" on public.products for update using (true);
create policy "products_delete" on public.products for delete using (true);

create policy "inquiries_select" on public.inquiries for select using (true);
create policy "inquiries_insert" on public.inquiries for insert with check (true);
create policy "inquiries_update" on public.inquiries for update using (true);

create policy "orders_select" on public.orders for select using (true);
create policy "orders_insert" on public.orders for insert with check (true);
create policy "orders_update" on public.orders for update using (true);
