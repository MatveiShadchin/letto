-- Актуализация категорий каталога:
-- убраны «гиганты» и «вазы», добавлены «комнатные растения»

update products set category = 'букеты' where lower(trim(category)) = 'гиганты';
update products set category = 'композиции' where lower(trim(category)) = 'вазы';
