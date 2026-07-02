-- Добавление отзывов, точки самовывоза и рейтинга популярности (без удаления данных)

alter table orders add column if not exists pickup_store text;

alter table products add column if not exists popularity_score integer not null default 0;

create table if not exists reviews (
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

create index if not exists reviews_published_sort_idx on reviews (is_published, sort_order, review_date desc);

grant all privileges on table reviews to letto;
alter table reviews owner to letto;

insert into reviews (author, rating, review_date, text, bouquet, company_response, accent, sort_order)
select * from (values
  ('Анна Петрова', 5, '2024-05-15'::date, 'Очень довольна покупкой! Букет был свежий и красивый, доставили точно в срок. Флорист прислал фото перед отправкой — это очень приятно. Обязательно закажу ещё раз.', 'Букет «Нежность»', 'Анна, спасибо за тёплые слова! Рады, что букет попал в настроение вашего праздника. Ждём вас снова в Летто.', 'from-[#F9E8E8] to-[#FFF5F5]', 1),
  ('Иван Сидоров', 4, '2024-06-22'::date, 'Хороший сервис, цветы свежие и соответствовали описанию. Доставка немного задержалась, но менеджер предупредил заранее. В целом рекомендую.', 'Монобукет из красных роз', 'Иван, благодарим за честный отзыв! Мы уже усилили логистику в вашем районе — следующий заказ доставим ещё аккуратнее.', 'from-[#FCE4EC] to-[#FFF0F3]', 2),
  ('Елена Козлова', 5, '2024-07-10'::date, 'Потрясающий букет! Мама была в восторге от подарка. Упаковка аккуратная, аромат невероятный. Спасибо за внимательное отношение к клиенту.', 'Весенняя композиция', null, 'from-[#E8F5E9] to-[#F1F8F2]', 3),
  ('Мария Волкова', 5, '2024-08-03'::date, 'Заказывали на юбилей — масштаб впечатлил всех гостей. Розы стояли больше недели. Оформление идеальное, как на фото в каталоге.', 'Букет «Королевский»', null, 'from-[#FFE4E1] to-[#FFF5F3]', 4),
  ('Дмитрий Орлов', 5, '2024-09-18'::date, 'Собрали комплект «цветы + шары» за один звонок. Курьер вежливый, всё привезли в коробке — ничего не помялось. Жена сказала: лучший сюрприз.', 'Шары «С Днём Рождения» + букет', 'Дмитрий, спасибо! Для нас важно, чтобы подарок выглядел празднично с первой секунды — рады, что попали в цель.', 'from-[#E3F2FD] to-[#F5FAFF]', 5),
  ('Ольга Смирнова', 5, '2024-11-02'::date, 'Постоянно заказываю здесь букеты коллегам. Всегда свежие цветы, красивая лента и открытка в подарок. Цены адекватные для такого качества.', 'Букет «Осенняя гармония»', null, 'from-[#FFF8E1] to-[#FFFBF0]', 6)
) as seed(author, rating, review_date, text, bouquet, company_response, accent, sort_order)
where not exists (select 1 from reviews limit 1);
