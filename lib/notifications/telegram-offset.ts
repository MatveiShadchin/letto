import { hasDatabase, query } from '@/lib/db';

const OFFSET_KEY = 'telegram_update_offset';

export async function getTelegramUpdateOffset(): Promise<number> {
  if (!hasDatabase()) return 0;

  const { rows } = await query<{ value: string }>(
    `SELECT value FROM notification_state WHERE key = $1`,
    [OFFSET_KEY]
  );

  const parsed = Number(rows[0]?.value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function setTelegramUpdateOffset(offset: number): Promise<void> {
  if (!hasDatabase() || !Number.isFinite(offset) || offset < 0) return;

  await query(
    `INSERT INTO notification_state (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key)
     DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [OFFSET_KEY, String(Math.floor(offset))]
  );
}
