import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError') {
      return 'Сервер не отвечает. Проверьте интернет и Supabase.';
    }
    return err.message || fallback;
  }

  if (typeof err === 'object' && err && 'message' in err) {
    return String((err as { message: unknown }).message) || fallback;
  }

  return fallback;
}
