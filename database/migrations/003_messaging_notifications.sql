-- Контакты мессенджеров для уведомлений (Telegram, VK, WhatsApp, MAX)

alter table orders add column if not exists preferred_notify_channel text;
alter table orders add column if not exists telegram_chat_id text;
alter table orders add column if not exists vk_user_id text;
alter table orders add column if not exists whatsapp_phone text;
alter table orders add column if not exists max_chat_id text;

create table if not exists notification_log (
  id bigserial primary key,
  order_id uuid references orders(id) on delete set null,
  channel text not null,
  event text not null,
  audience text not null default 'customer',
  recipient text,
  status text not null,
  error text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notification_log_order_idx on notification_log (order_id);
create index if not exists notification_log_created_idx on notification_log (created_at desc);

-- Привязка клиента к мессенджеру до оформления заказа (через webhook / deep-link)
create table if not exists messenger_links (
  id bigserial primary key,
  channel text not null,
  external_id text not null,
  phone text,
  customer_name text,
  metadata jsonb not null default '{}'::jsonb,
  linked_at timestamptz not null default now(),
  unique (channel, external_id)
);

create index if not exists messenger_links_phone_idx on messenger_links (phone);
