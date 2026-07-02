-- Обновить картинки у уже созданных товаров
-- Supabase → SQL Editor → Run

update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-1/800/800' where name = 'Букет «Нежность»';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-2/800/800' where name = 'Монобукет из красных роз';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-3/800/800' where name = 'Букет «Королевский»';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-4/800/800' where name = 'Весенняя композиция';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-5/800/800' where name = 'Плюшевый мишка';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-6/800/800' where name = 'Шары «С Днём Рождения»';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-7/800/800' where name = 'Ваза «Элегант»';
update public.products set image_url = 'https://picsum.photos/seed/letto-flowers-8/800/800' where name = 'Букет «Осенняя гармония»';

-- Если названия другие — обновить все товары по очереди
update public.products
set image_url = 'https://placehold.co/800x800/F3F2F1/5E4037/png?text=%D0%9B%D0%B5%D1%82%D1%82%D0%BE'
where image_url is null or image_url = '';
