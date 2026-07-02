/**
 * Полная настройка Supabase для Летто:
 * 1. Загружает фото товаров в Storage (bucket product-images)
 * 2. Записывает товары в таблицу products с URL из Supabase
 *
 * Перед запуском выполните в SQL Editor: supabase/schema.sql и supabase/storage.sql
 * Запуск: npm run supabase:setup
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BUCKET = 'product-images';

const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ Нет файла .env.local');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Проверьте NEXT_PUBLIC_SUPABASE_URL и ключ в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    slug: 'bouquet-nezhnost',
    name: 'Букет «Нежность»',
    description: 'Розовые и белые розы с эустомой — идеальный романтический подарок.',
    details: 'Упаковка крафт, лента в подарок. Высота букета ~45 см.',
    price: 250000,
    category: 'букеты',
    stock: 12,
    is_popular: true,
    featured_slot: 1,
    sourceUrl: 'https://placehold.co/800x800/D4A5A5/FFFFFF/jpeg?text=%D0%9B%D0%B5%D1%82%D1%82%D0%BE',
  },
  {
    slug: 'mono-red-roses',
    name: 'Монобукет из красных роз',
    description: '25 алых роз — классика для признания в любви.',
    details: 'Длина стебля 60 см, премиальная упаковка.',
    price: 180000,
    category: 'монобукеты',
    stock: 8,
    is_popular: true,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/C0392B/FFFFFF/jpeg?text=Roses',
  },
  {
    slug: 'bouquet-korolevskiy',
    name: 'Букет «Королевский»',
    description: '101 красная роза для особого случая.',
    details: 'Величественная композиция, доставка в коробке.',
    price: 550000,
    category: 'гиганты',
    stock: 3,
    is_popular: false,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/922B21/FFFFFF/jpeg?text=Royal',
  },
  {
    slug: 'spring-composition',
    name: 'Весенняя композиция',
    description: 'Тюльпаны, нарциссы и ирисы — свежесть весны.',
    details: 'Сезонный букет, состав может незначительно меняться.',
    price: 320000,
    category: 'композиции',
    stock: 10,
    is_popular: true,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/27AE60/FFFFFF/jpeg?text=Spring',
  },
  {
    slug: 'teddy-bear',
    name: 'Плюшевый мишка',
    description: 'Мягкий мишка 40 см — отличное дополнение к букету.',
    details: 'Гипоаллергенный наполнитель, сертифицированный материал.',
    price: 120000,
    category: 'игрушки',
    stock: 15,
    is_popular: false,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/E67E22/FFFFFF/jpeg?text=Teddy',
  },
  {
    slug: 'birthday-balloons',
    name: 'Шары «С Днём Рождения»',
    description: 'Набор из 10 гелиевых шаров с надписью.',
    details: 'Шары держат форму 8–12 часов в помещении.',
    price: 80000,
    category: 'шары',
    stock: 20,
    is_popular: true,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/2980B9/FFFFFF/jpeg?text=Balloons',
  },
  {
    slug: 'vase-elegant',
    name: 'Ваза «Элегант»',
    description: 'Стеклянная ваза 30 см для любых композиций.',
    details: 'Закалённое стекло, подходит для букетов до 70 см.',
    price: 150000,
    category: 'вазы',
    stock: 6,
    is_popular: false,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/566573/FFFFFF/jpeg?text=Vase',
  },
  {
    slug: 'bouquet-autumn',
    name: 'Букет «Осенняя гармония»',
    description: 'Хризантемы и герберы в тёплых осенних тонах.',
    details: 'Стойкий букет, сохраняет свежесть до 10 дней.',
    price: 280000,
    category: 'букеты',
    stock: 9,
    is_popular: true,
    featured_slot: null,
    sourceUrl: 'https://placehold.co/800x800/D68910/FFFFFF/jpeg?text=Autumn',
  },
];

async function uploadImage(slug, sourceUrl) {
  let lastError;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const path = `products/${slug}.jpg`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
        cacheControl: '31536000',
      });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      lastError = error;
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }

  throw lastError;
}

async function main() {
  console.log('🔗 Supabase:', supabaseUrl);
  console.log('');

  const { error: bucketError } = await supabase.storage.from(BUCKET).list('products', {
    limit: 1,
  });

  if (bucketError) {
    console.error('❌ Bucket product-images не найден или нет доступа.');
    console.error('   Выполните supabase/storage.sql в Supabase SQL Editor');
    console.error('   Ошибка:', bucketError.message);
    process.exit(1);
  }

  const { error: tableError } = await supabase.from('products').select('id').limit(1);
  if (tableError) {
    console.error('❌ Таблица products не найдена.');
    console.error('   Выполните supabase/schema.sql в Supabase SQL Editor');
    console.error('   Ошибка:', tableError.message);
    process.exit(1);
  }

  console.log('📤 Загрузка фото в Supabase Storage...\n');

  const rows = [];

  for (const product of products) {
    process.stdout.write(`   ${product.name}... `);
    try {
      const imageUrl = await uploadImage(product.slug, product.sourceUrl);
      rows.push({
        name: product.name,
        description: product.description,
        details: product.details,
        price: product.price,
        image_url: imageUrl,
        category: product.category,
        stock: product.stock,
        is_popular: product.is_popular,
        featured_slot: product.featured_slot,
      });
      console.log('✅');
    } catch (err) {
      console.log('❌');
      console.error(`      ${err.message}`);
      process.exit(1);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n🗑️  Очистка старых товаров...');
  const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('❌', deleteError.message);
    process.exit(1);
  }

  console.log('💾 Добавление товаров в базу...\n');
  const { data, error: insertError } = await supabase.from('products').insert(rows).select('name, image_url');

  if (insertError) {
    console.error('❌', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Готово! Товаров: ${data.length}\n`);
  data.forEach((item) => {
    console.log(`   • ${item.name}`);
    console.log(`     ${item.image_url}\n`);
  });

  console.log('Обновите сайт (Ctrl+F5) — картинки теперь из Supabase Storage.');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
