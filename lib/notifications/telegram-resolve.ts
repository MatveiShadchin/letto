import { hasDatabase, query } from '@/lib/db';
import { Order } from '@/types/order';

function stripAt(value: string): string {
  return value.trim().replace(/^@+/, '');
}

export function isNumericTelegramChatId(value: string): boolean {
  return /^-?\d+$/.test(value.trim());
}

export async function findTelegramChatIdByUsername(username: string): Promise<string | null> {
  if (!hasDatabase()) return null;

  const normalized = stripAt(username).toLowerCase();
  if (!normalized) return null;

  const { rows } = await query<{ external_id: string }>(
    `SELECT external_id
     FROM messenger_links
     WHERE channel = 'telegram'
       AND (
         lower(COALESCE(metadata->>'username', '')) = $1
         OR lower(external_id) = $1
       )
     ORDER BY linked_at DESC
     LIMIT 1`,
    [normalized]
  );

  const externalId = rows[0]?.external_id;
  return externalId && isNumericTelegramChatId(externalId) ? externalId : null;
}

export async function resolveTelegramRecipientAddress(
  order: Order,
  address: string
): Promise<string> {
  const trimmed = address.trim();
  if (!trimmed) return trimmed;

  if (isNumericTelegramChatId(trimmed)) {
    return trimmed;
  }

  const fromUsername = await findTelegramChatIdByUsername(trimmed);
  if (fromUsername) {
    return fromUsername;
  }

  const phoneDigits = order.phone?.replace(/\D/g, '');
  if (phoneDigits && hasDatabase()) {
    const { rows } = await query<{ external_id: string }>(
      `SELECT external_id
       FROM messenger_links
       WHERE channel = 'telegram'
         AND regexp_replace(COALESCE(phone, ''), '\\D', '', 'g') = $1
       ORDER BY linked_at DESC
       LIMIT 1`,
      [phoneDigits]
    );
    const externalId = rows[0]?.external_id;
    if (externalId && isNumericTelegramChatId(externalId)) {
      return externalId;
    }
  }

  return trimmed.startsWith('@') ? trimmed : `@${stripAt(trimmed)}`;
}
