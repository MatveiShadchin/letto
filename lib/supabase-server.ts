import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Supabase не настроен. Добавьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SECRET_KEY в .env.local'
      );
    }

    client = createClient(url, key);
  }

  return client;
}
