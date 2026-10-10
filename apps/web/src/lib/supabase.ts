import { createClient } from '@supabase/supabase-js';

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  .trim()
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');
const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

if (!url || !key) {
  throw new Error('Missing Supabase env vars');
}

export const supabase = createClient(url, key);
