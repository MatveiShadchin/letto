-- Летто — PostgreSQL (Timeweb / Selectel / любой VPS)
-- Выполнить один раз в psql или через панель БД

create extension if not exists "pgcrypto";

drop table if exists orders cascade;
drop table if exists inquiries cascade;
drop table if exists products cascade;

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  details text,
  price integer not null default 0 check (price >= 0),
  image_url text not null default '',
  category text not null default '',
  stock integer not null default 0 check (stock >= 0),
  is_popular boolean not null default false,
  popularity_score integer not null default 0,
  featured_slot integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on products (category);
create index products_created_at_idx on products (created_at desc);
create index products_featured_slot_idx on products (featured_slot) where featured_slot is not null;

create index products_popularity_idx on products (popularity_score desc, is_popular desc);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_date date not null default current_date,
  text text not null,
  bouquet text,
  company_response text,
  accent text not null default 'from-[#F9E8E8] to-[#FFF5F5]',
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index reviews_published_sort_idx on reviews (is_published, sort_order, review_date desc);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'responded')),
  created_at timestamptz not null default now()
);

create index inquiries_status_idx on inquiries (status);
create index inquiries_created_at_idx on inquiries (created_at desc);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  recipient_name text,
  recipient_phone text,
  recipient_address text,
  special_wishes text,
  street text,
  house text,
  pickup_store text,
  delivery_method text not null default 'courier' check (delivery_method in ('courier', 'pickup')),
  delivery_date date,
  delivery_time text,
  items jsonb not null default '[]'::jsonb,
  items_total integer not null default 0,
  delivery_cost integer not null default 0,
  total integer not null default 0,
  status text not null default 'new' check (status in ('new', 'processing', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index orders_status_idx on orders (status);
create index orders_created_at_idx on orders (created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

-- Права для приложения (таблицы создаются от postgres)
grant usage on schema public to letto;
grant all privileges on all tables in schema public to letto;
grant all privileges on all sequences in schema public to letto;
grant execute on function set_updated_at() to letto;
alter table products owner to letto;
alter table inquiries owner to letto;
alter table reviews owner to letto;
alter table orders owner to letto;
alter function set_updated_at() owner to letto;
