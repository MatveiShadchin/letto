-- ============================================================
-- Летто — полная настройка (шаг 1 из 2)
-- Supabase → SQL Editor → вставить → Run
-- Затем в терминале: npm run supabase:setup
-- ============================================================

-- Таблицы
drop table if exists public.orders cascade;
drop table if exists public.inquiries cascade;
drop table if exists public.products cascade;

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

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'responded')),
  created_at timestamptz not null default now()
);

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

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

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

-- Storage для фото
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_upload" on storage.objects;
drop policy if exists "product_images_update" on storage.objects;
drop policy if exists "product_images_delete" on storage.objects;

create policy "product_images_public_read"
on storage.objects for select using (bucket_id = 'product-images');

create policy "product_images_upload"
on storage.objects for insert with check (bucket_id = 'product-images');

create policy "product_images_update"
on storage.objects for update using (bucket_id = 'product-images');

create policy "product_images_delete"
on storage.objects for delete using (bucket_id = 'product-images');
