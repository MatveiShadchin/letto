-- Состояние long-poll синхронизации Telegram (getUpdates через GitHub Actions)

create table if not exists notification_state (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
