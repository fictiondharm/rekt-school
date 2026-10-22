import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface PaymentRow {
  txHash: string;
  chain: string;
  wallet: string;
  toWallet: string;
  tokenAmount: number;
  currency: string;
  usdValue: number;
  paidAt: string;
}

/**
 * Records the payment in the `payments` table.
 *
 * The `payments` schema differs between databases — this project ships
 * `tx_hash` / `chain` / status `confirmed`, older ones use `reference` /
 * `signature` / status `paid` — so the row is built from role candidates and
 * corrected from the database error until it inserts. The insert is
 * best-effort: access itself is granted by the `entitlements` table.
 */
export async function recordPayment(row: PaymentRow) {
  const roles: { names: string[]; value: unknown }[] = [
    { names: ['tx_hash', 'signature', 'reference'], value: row.txHash },
    { names: ['chain'], value: row.chain },
    { names: ['from_wallet', 'payer_wallet', 'wallet'], value: row.wallet },
    { names: ['to_wallet', 'treasury_wallet'], value: row.toWallet },
    { names: ['amount', 'amount_usdc', 'amount_usd'], value: row.tokenAmount },
    { names: ['currency'], value: row.currency },
    { names: ['status'], value: 'confirmed' },
    { names: ['amount_usdc'], value: row.usdValue },
    { names: ['payer_wallet'], value: row.wallet },
    { names: ['paid_at'], value: row.paidAt },
  ];
  const statusValues = ['confirmed', 'paid', 'completed'];

  const build = () => {
    const payload: Record<string, unknown> = {};
    for (const role of roles) {
      if (!role.names[0]) continue;
      payload[role.names[0]] = role.value;
    }
    return payload;
  };

  const advance = (column: string) => {
    for (let i = 0; i < roles.length; i += 1) {
      const role = roles[i];
      const index = role.names.indexOf(column);
      if (index === -1) continue;
      if (role.names[0] === 'status') {
        const next = statusValues.indexOf(String(role.value)) + 1;
        if (next < statusValues.length) {
          role.value = statusValues[next];
          return true;
        }
        return false;
      }
      if (index + 1 < role.names.length) {
        role.names.splice(index, 1);
        return true;
      }
      // No other name for this role: drop the column entirely.
      role.names = [''];
      return true;
    }
    return false;
  };

  let payload = build();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const { error } = await supabaseAdmin.from('payments').insert(payload);

      if (!error) return true;
      // Already recorded (unique transaction hash).
      if (error.code === '23505') return true;

      const message = error.message || '';

      // Column does not exist in this database.
      const missing = message.match(/Could not find the '([^']+)' column/i)?.[1];
      if (missing && advance(missing)) {
        payload = build();
        continue;
      }

      // NOT NULL violation: the column exists but the row needs a value we
      // did not send, or the column is required.
      const notNull = message.match(/null value in column "([^"]+)"/i)?.[1];
      if (notNull) {
        const handled = roles.some((role) => {
          if (role.names.includes(notNull)) {
            if (role.names[0] === 'wallet') role.value = row.wallet;
            return advance(notNull);
          }
          return false;
        });
        if (handled) {
          payload = build();
          continue;
        }
      }

      // CHECK constraint on the status vocabulary.
      if (/violates check constraint/i.test(message) && advance('status')) {
        payload = build();
        continue;
      }
    } catch {
      /* try the next shape */
    }

    // Last resort: the bare minimum row.
    payload = { tx_hash: row.txHash, chain: row.chain, status: 'confirmed' };
  }

  console.warn('[payments] could not record the payment row');
  return false;
}

/**
 * Grants the wallet lifetime access to every lesson. Keyed by wallet so the
 * same buyer is never asked to pay again on any device.
 */
export async function grantEntitlement(wallet: string) {
  try {
    await supabaseAdmin.from('entitlements').upsert(
      {
        wallet,
        tier: 'all',
        source: 'payment',
        paid_at: new Date().toISOString(),
      },
      { onConflict: 'wallet' }
    );
  } catch (e) {
    console.warn('[payments] entitlement upsert threw:', e);
  }
}

/**
 * True when `wallet` already paid. `'unreachable'` means the database could
 * not be queried, which callers must not treat as "not paid".
 */
export async function hasPaidAccess(wallet: string): Promise<boolean | 'unreachable'> {
  try {
    const { data, error } = await supabaseAdmin
      .from('entitlements')
      .select('tier')
      .eq('wallet', wallet)
      .maybeSingle();

    if (error) {
      if (/fetch failed|timeout|abort/i.test(error.message)) return 'unreachable';
    } else if (data) {
      return true;
    }

    // Fallback for databases where the entitlement row is missing: look for a
    // recorded payment. Column names and status vocabulary differ between
    // databases, so each variant is tried.
    const paidStatuses = ['confirmed', 'paid', 'completed'];
    for (const column of ['from_wallet', 'payer_wallet', 'wallet']) {
      const { data: rows, error: rowsError } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq(column, wallet)
        .in('status', paidStatuses)
        .limit(1);

      if (rowsError) {
        if (/fetch failed|timeout|abort/i.test(rowsError.message)) return 'unreachable';
        continue;
      }
      if (rows && rows.length > 0) return true;
    }

    return false;
  } catch {
    return 'unreachable';
  }
}
