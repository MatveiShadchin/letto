-- Поля получателя и особых пожеланий для заказов с доставкой

alter table orders add column if not exists recipient_name text;
alter table orders add column if not exists recipient_phone text;
alter table orders add column if not exists recipient_address text;
alter table orders add column if not exists special_wishes text;
