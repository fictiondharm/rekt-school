import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client.
 *
 * The browser client (`@/lib/supabase`) uses the anon key, which cannot write
 * to tables that have Row Level Security enabled — including `payments`. Route
 * handlers that record a verified payment use this client instead, so the
 * service role key never reaches the browser.
 *
 * If the service role key is missing we fall back to the anon key. Writes then
 * depend on the anon key having an insert policy, but reads still work.
 */
function getServiceKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
}

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
  const serviceKey = getServiceKey();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  const key = serviceKey || anonKey;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars');
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // A dead or misconfigured database must never hang a request: every
    // query is capped and the route falls back to the local unlock flag.
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(6000) }),
    },
  });
  return client;
}

/** True when the server can write to Supabase without RLS blocking it. */
export function hasServiceRoleKey(): boolean {
  return getServiceKey().length > 0;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseAdmin() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
