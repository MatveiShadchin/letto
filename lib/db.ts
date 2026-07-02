import { Pool, QueryResultRow } from 'pg';

let pool: Pool | undefined;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL не задан. Добавьте PostgreSQL в .env.local');
    }
    pool = new Pool({
      connectionString,
      max: 4,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  return getPool().query<T>(text, params);
}
