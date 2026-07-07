-- Связь сообщений в группе флористов с чатом клиента (ответ реплаем)

create table if not exists telegram_support_relay (
  id bigserial primary key,
  group_chat_id text not null,
  group_message_id bigint not null,
  customer_chat_id text not null,
  order_id uuid references orders(id) on delete set null,
  customer_name text,
  created_at timestamptz not null default now(),
  unique (group_chat_id, group_message_id)
);

create index if not exists telegram_support_relay_customer_idx
  on telegram_support_relay (customer_chat_id, created_at desc);
