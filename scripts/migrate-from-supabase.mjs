#!/usr/bin/env node
/**
 * Перенос данных Supabase → PostgreSQL на VPS
 * Запуск на сервере: node scripts/migrate-from-supabase.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = {
  ...loadEnvFile(resolve(process.cwd(), '.env.local')),
  ...process.env,
};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const databaseUrl = env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SECRET_KEY в .env.local');
  process.exit(1);
}

if (!databaseUrl) {
  console.error('Нужен DATABASE_URL в .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const pool = new Pool({ connectionString: databaseUrl });

async function migrateTable(name, selectQuery, insertSql, mapRow) {
  console.log(`→ ${name}...`);
  const { data, error } = await supabase.from(name).select('*');
  if (error) throw error;

  await pool.query(`TRUNCATE ${name} CASCADE`);

  for (const row of data ?? []) {
    const values = mapRow(row);
    await pool.query(insertSql, values);
  }

  console.log(`  ok: ${data?.length ?? 0} записей`);
  return data?.length ?? 0;
}

try {
  const productCount = await migrateTable(
    'products',
    '*',
    `INSERT INTO products (
      id, name, description, details, price, image_url, category, stock,
      is_popular, featured_slot, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    (r) => [
      r.id,
      r.name,
      r.description ?? '',
      r.details ?? null,
      r.price ?? 0,
      r.image_url ?? '',
      r.category ?? '',
      r.stock ?? 0,
      r.is_popular ?? false,
      r.featured_slot ?? null,
      r.created_at ?? new Date().toISOString(),
    ]
  );

  await migrateTable(
    'inquiries',
    '*',
    `INSERT INTO inquiries (id, name, email, phone, message, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    (r) => [
      r.id,
      r.name,
      r.email ?? null,
      r.phone ?? null,
      r.message,
      r.status ?? 'new',
      r.created_at ?? new Date().toISOString(),
    ]
  );

  await migrateTable(
    'orders',
    '*',
    `INSERT INTO orders (
      id, customer_name, phone, street, house, delivery_method, delivery_time,
      items, items_total, delivery_cost, total, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12,$13)`,
    (r) => [
      r.id,
      r.customer_name,
      r.phone,
      r.street ?? null,
      r.house ?? null,
      r.delivery_method ?? 'courier',
      r.delivery_time ?? null,
      JSON.stringify(r.items ?? []),
      r.items_total ?? 0,
      r.delivery_cost ?? 0,
      r.total ?? 0,
      r.status ?? 'new',
      r.created_at ?? new Date().toISOString(),
    ]
  );

  console.log(`\nГотово: ${productCount} товаров в локальном PostgreSQL`);
} catch (error) {
  console.error('\nОшибка миграции:', error.message || error);
  process.exit(1);
} finally {
  await pool.end();
}
