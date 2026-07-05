-- Текст контакта мессенджера, как указал клиент при оформлении

alter table orders add column if not exists messenger_contact text;
