-- Дата доставки для курьерских заказов

alter table orders add column if not exists delivery_date date;
