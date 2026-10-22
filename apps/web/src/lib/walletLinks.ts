import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Stores a two-way link between a Solana address and an EVM address. Both
 * directions are written so a lookup never needs to traverse a graph.
 */
export async function linkWallets(a: string, b: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('wallet_links').upsert(
    [
      { wallet: a, linked_wallet: b },
      { wallet: b, linked_wallet: a },
    ],
    { onConflict: 'wallet,linked_wallet' }
  );

  if (error) {
    console.warn('[wallet-links] upsert failed:', error.message);
    return false;
  }
  return true;
}

/** Addresses proven to belong to the same person as `wallet`. */
export async function resolveLinkedWallets(wallet: string): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('wallet_links')
      .select('linked_wallet')
      .eq('wallet', wallet)
      .limit(10);

    if (error || !data) return [];
    return data
      .map((row) => row.linked_wallet as string)
      .filter((linked) => typeof linked === 'string' && linked && linked !== wallet);
  } catch {
    return [];
  }
}
