import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function jwtPayload(token: string): any {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export async function GET() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const url = rawUrl.trim().replace(/\/+$/, '');
  const host = url ? url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : null;
  const urlRef = host ? host.split('.')[0] : null;
  const payload = key ? jwtPayload(key) : null;

  const out: Record<string, unknown> = {
    configured: !!url && !url.includes('your-project') && !!key,
    urlRaw: rawUrl,
    urlEndsWithSlash: rawUrl.trim().endsWith('/'),
    urlHasExtraPath: /supabase\.co\/.+/i.test(rawUrl.trim()),
    urlHost: host,
    urlProjectRef: urlRef,
    keyRole: payload?.role ?? null,
    keyProjectRef: payload?.ref ?? null,
    keyMatchesUrl: !!(payload?.ref && urlRef && payload.ref === urlRef),
    keyLooksValid: !!payload?.role,
  };

  if (url && key) {
    try {
      const sb = createClient(url, key);
      const { data, error, count } = await sb
        .from('invite_codes')
        .select('code', { count: 'exact' })
        .limit(1);
      out.inviteCodesReachable = !error;
      out.inviteCodesCount = count ?? null;
      out.dbError = error ? { code: error.code, message: error.message, hint: error.hint } : null;
      out.sampleOk = !!data;
    } catch (e) {
      out.dbThrew = String(e);
    }
  }

  return NextResponse.json(out);
}
