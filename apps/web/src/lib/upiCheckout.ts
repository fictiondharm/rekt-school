/**
 * UPI checkout.
 *
 * The repo has no UPI payment gateway wired up (no Razorpay Cashier, PhonePe PG
 * or similar SDK is installed), so the UPI path currently stops here.
 *
 * TODO: replace `startUpiCheckoutStub` with a real gateway call. The contract
 * the rest of the app depends on is:
 *   - it returns `{ ok: true, ... }` once the user has been redirected to the
 *     gateway and a payment reference exists, or
 *   - it returns `{ ok: false, message }` with a human readable reason so the
 *     caller can show it inline.
 * The invite code redeemed after a successful UPI payment should be minted by
 * the same flow the USDC path uses (see /api/payments/check).
 */

export interface UpiCheckoutRequest {
  amountInr: number;
  /** Optional id used to reconcile the payment with a user. */
  reference?: string;
}

export interface UpiCheckoutResult {
  ok: boolean;
  message: string;
  /** Present when the gateway returns a hosted checkout URL. */
  checkoutUrl?: string;
  /** Present when the gateway returns a payment reference to poll. */
  reference?: string;
}

export const UPI_CHECKOUT_UNAVAILABLE_MESSAGE =
  'UPI checkout is not connected yet. Use crypto (USDC) to unlock the course, or redeem an invite code.';

export async function startUpiCheckoutStub(
  _request: UpiCheckoutRequest
): Promise<UpiCheckoutResult> {
  // TODO: create a real UPI order via the payment gateway and return its
  // checkout URL / reference here.
  return { ok: false, message: UPI_CHECKOUT_UNAVAILABLE_MESSAGE };
}
