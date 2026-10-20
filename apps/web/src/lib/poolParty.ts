/**
 * Pool Party - provide liquidity, watch impermanent loss happen to you.
 *
 * Pure math + config. No React, no side effects, no randomness at module scope.
 * Every balance-related dial lives in POOL_CONFIG / POOLS / SCENARIOS so the
 * whole game can be rebalanced from one place.
 *
 * The model (deliberately simplified, but honest):
 *  - A 50/50 constant-product pool. You deposit dollars; your position is a set
 *    of "tranches", each fixed at the price ratio of the day you added it.
 *  - LP value of a tranche at price ratio r:  value * sqrt(r / entryRatio).
 *    (Classic result: a 50/50 LP position scales with the square root of the
 *    price ratio measured from its entry point.)
 *  - HODL value of the same tranche held OUTSIDE the pool:
 *    value * (1 + r / entryRatio) / 2.  (Half the dollars in each token, never
 *    rebalanced.)
 *  - Impermanent loss, in dollars: LP value - HODL value. Always <= 0 for a
 *    single tranche - (1+r)/2 >= sqrt(r) by AM-GM - so IL is a *drag*, never a
 *    windfall. Fees are the only upside.
 *  - Fees: each day the pool trades, fees accrue proportional to your share.
 *    We abstract pool TVL x volume x fee-rate into a single per-pool dial
 *    "fee income per $1,000 of position per unit of daily volume activity",
 *    scaled by the scenario's volumeIndex. Fees are credited as cash and are
 *    NOT compounded back into the pool (stated plainly in the UI).
 *  - The HODL comparison uses the exact same tranches, so "net vs just
 *    holding" is apples to apples. Unspent cash cancels out of the comparison
 *    and is therefore ignored in the math (shown separately in the UI).
 */

import { mulberry32, hashSeed } from './rugTycoon';

/**
 * Games on Rekt School are NOT payment-gated - this flag exists so the intent
 * is explicit and greppable. Never wire it to the paywall: lessons are the
 * paid product, arcade games are free marketing for the lessons.
 */
export const GAME_REQUIRES_UNLOCK = false;

export type PoolId = 'stable' | 'bluechip' | 'memecoin';
export type ScenarioId = 'grind' | 'pump' | 'chop';

export interface Pool {
  id: PoolId;
  name: string;
  tagline: string;
  risk: string;
  blurb: string;
  /**
   * Fee income per $1,000 of LP position per unit of volumeIndex, per day.
   * This single dial absorbs TVL x daily volume x fee-rate so the numbers stay
   * human-scale on a $500 deposit. Tuned so fees and IL land in the same
   * dollar range - that is what makes the trade-off real.
   */
  feePer1k: number;
  /**
   * Price-amplitude multiplier applied to scenario price moves.
   * stable  = swings are ~15% of base -> IL stays pennies.
   * bluechip= half the base amplitude -> IL manageable, fees solid.
   * memecoin= 1.6x base amplitude -> IL can dwarf fees on trend scenarios.
   */
  volFactor: number;
}

export interface ScenarioDay {
  headline: string;
  note: string;
  reactor: 'carl' | 'fiona' | 'harry' | 'wanda' | 'nina';
  line: string;
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  blurb: string;
  /** Base price ratio at the END of each day (day 0..5), starting from 1. */
  ratios: number[];
  /** Daily volume activity index, multiplies the pool's fee income. */
  volumeIndex: number[];
  /**
   * The last day worth exiting on for this scenario (1-based day number), or
   * null when staying the course is usually right. Used only to name the
   * "smart exit" bonus in the UI - the bonus itself is earned by actually
   * beating the counterfactual of holding to the end.
   */
  smartExitDay: number | null;
  days: ScenarioDay[];
}

/** One deposit tranche: dollars deposited, and the price ratio when deposited. */
export interface Tranche {
  value: number;
  entryRatio: number;
}

export interface RunResult {
  poolId: PoolId;
  scenarioId: ScenarioId;
  /** 0-based day the player withdrew on, or 5 when they stayed the whole run. */
  withdrawDay: number;
  earlyWithdraw: boolean;
  tranches: Tranche[];
  fees: number;
  lpValue: number;
  hodlValue: number;
  /** LP value - HODL value. Negative: impermanent loss. */
  ilDollars: number;
  /** LP value + fees - HODL value. The only number that pays the bills. */
  net: number;
  /** Player exited early AND that beat holding to the end. */
  smartExit: boolean;
  /** Player picked the pool this scenario rewards. */
  poolFit: boolean;
  score: number;
  rank: { title: string; blurb: string };
  verdict: { title: string; blurb: string };
  explanation: string;
  /**
   * What the run would have looked like had the player held to day 5.
   * `net` is net-vs-HODL at day 5; `wealth` is lpValue + fees - the number the
   * smart-exit check actually uses, because comparing net-vs-HODL across
   * different days is misleading (the HODL baseline itself moves with price).
   */
  counterfactual: { lpValue: number; fees: number; net: number; wealth: number } | null;
  /** (endRatio - 1) * 100, e.g. 36 for "ended 36% higher". */
  priceMovePct: number;
}

export const POOL_CONFIG = {
  /** Dollars deposited into the pool on day 1. */
  startingDeposit: 500,
  /** Dry powder for mid-run adds. Cancels out of the net-vs-HODL comparison. */
  reserve: 300,
  addAmount: 100,
  maxAdds: 3,
  days: 6,
  /** $1 of net-vs-HODL = this many score points. */
  netScale: 10,
  /**
   * Bonus for exiting early with more money in hand (lp + fees) than holding
   * the same position to the end would have left. Rewards reading the tape,
   * not just surviving.
   */
  smartWithdrawBonus: 600,
  /** Bonus for picking the pool this scenario rewards. */
  poolFitBonus: 400,
  /** Aura earned per this many points of score. */
  auraPerScore: 200,
  /** Price moves smaller than this (in %) count as "barely moved" for verdicts. */
  flatThresholdPct: 2,
  /** |net| below this many dollars is "too close to call". */
  washThreshold: 5,
} as const;

export const POOLS: Pool[] = [
  {
    id: 'stable',
    name: 'Stable Swap',
    tagline: 'Stablecoins that barely move',
    risk: 'Low drama',
    blurb:
      'The safest pool here. Tiny price swings mean almost no impermanent loss - and fees that barely justify the click.',
    feePer1k: 0.8,
    volFactor: 0.15,
  },
  {
    id: 'bluechip',
    name: 'Blue-chip Pool',
    tagline: 'The everyday LP experience',
    risk: 'Moderate',
    blurb:
      'SOL/USDC energy. Real moves, real fees, and impermanent loss that shows up whenever a trend runs without you.',
    feePer1k: 2.5,
    volFactor: 0.5,
  },
  {
    id: 'memecoin',
    name: 'Memecoin Splash',
    tagline: 'Fees are huge. So is the bleed.',
    risk: 'High',
    blurb:
      'Wild swings and heavy volume. Fees pile up fast - and so does impermanent loss the moment the chart stops going sideways.',
    feePer1k: 6,
    volFactor: 1.6,
  },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'grind',
    name: 'Slow grind',
    blurb: 'Six green days. Boring, until you add up the fees.',
    ratios: [1.05, 1.1, 1.16, 1.22, 1.29, 1.36],
    volumeIndex: [0.8, 0.9, 1.0, 1.0, 1.1, 1.2],
    smartExitDay: null,
    days: [
      {
        headline: 'Prices edge up again',
        note: 'Nothing dramatic. Traders are quietly accumulating all morning.',
        reactor: 'fiona',
        line: 'Slow and steady. My bags grow without me doing anything.',
      },
      {
        headline: 'Another green candle',
        note: 'Volume picks up a little as the trend continues into day two.',
        reactor: 'harry',
        line: 'Trend is a trend until it is not. I am in.',
      },
      {
        headline: 'The grind continues',
        note: 'Third up day in a row. LPs are quietly earning on every swap.',
        reactor: 'nina',
        line: 'Fees are adding up I guess. Boring, but adding up.',
      },
      {
        headline: 'Momentum holds',
        note: 'No pullback yet. Impermanent loss is growing slowly, just out of sight.',
        reactor: 'carl',
        line: 'Up only charts make me nervous. Something will correct.',
      },
      {
        headline: 'Still climbing',
        note: 'Volume is steady. Your fee stack keeps ticking a little each day.',
        reactor: 'fiona',
        line: 'I keep checking my rewards. Is that healthy?',
      },
      {
        headline: 'Day six, still green',
        note: 'The trend held all week. Fees did their job - IL never got a chance to bite.',
        reactor: 'nina',
        line: 'So this is what they meant by yield.',
      },
    ],
  },
  {
    id: 'pump',
    name: 'Pump then dump',
    blurb: 'Moon boys day three. Reality days four to six.',
    ratios: [1.25, 1.55, 1.75, 1.2, 0.75, 0.55],
    volumeIndex: [1.2, 2.0, 2.5, 1.5, 2.0, 2.2],
    smartExitDay: 3,
    days: [
      {
        headline: 'Something is pumping',
        note: 'Volume spikes as the token takes off. Fees start flowing fast.',
        reactor: 'fiona',
        line: 'Green candle, red flags, I do not care. Going in.',
      },
      {
        headline: 'The pump accelerates',
        note: 'Double the volume overnight. Your fee meter is spinning.',
        reactor: 'harry',
        line: 'Momentum like this does not just stop. Right?',
      },
      {
        headline: 'Peak euphoria',
        note: 'As far as anyone knows, this is the top. The fees look incredible.',
        reactor: 'wanda',
        line: 'I have seen this movie before. The ending is not kind to LPs.',
      },
      {
        headline: 'The dump begins',
        note: 'Price reverses hard. Your pool is selling the token as it falls.',
        reactor: 'carl',
        line: 'There it is. This is what impermanent loss looks like in real time.',
      },
      {
        headline: 'Free fall',
        note: 'Volume explodes on the way down. Fees climb, but the position bleeds faster.',
        reactor: 'nina',
        line: 'Why is my LP worth less than just holding? Oh.',
      },
      {
        headline: 'Aftermath',
        note: 'The dust settles far below where the week started. Time to add up the damage.',
        reactor: 'carl',
        line: 'Fees were real. The loss was realer. Both can be true.',
      },
    ],
  },
  {
    id: 'chop',
    name: 'Sideways chop',
    blurb: 'No trend, no drama, no IL. Just fees, all week.',
    ratios: [1.02, 0.97, 1.04, 0.96, 1.03, 0.99],
    volumeIndex: [1.0, 1.2, 0.9, 1.3, 1.0, 0.9],
    smartExitDay: null,
    days: [
      {
        headline: 'Sideways day',
        note: 'Price wobbles, traders trade, fees accumulate. IL barely moves.',
        reactor: 'nina',
        line: 'Nothing is happening and I am somehow earning.',
      },
      {
        headline: 'A small dip',
        note: 'Down a little, likely back up before the close. Chop is LP friendly.',
        reactor: 'harry',
        line: 'Mean reversion. My favorite word when I am in a pool.',
      },
      {
        headline: 'Back up again',
        note: 'The range holds. Every swap inside it pays you a tiny slice.',
        reactor: 'fiona',
        line: 'Range trading, but I just sit here?',
      },
      {
        headline: 'Another wiggle',
        note: 'Volume spikes mid-range. Best case for fees, worst case for drama.',
        reactor: 'wanda',
        line: 'Range markets print fees for whoever is patient.',
      },
      {
        headline: 'Still stuck in range',
        note: 'Five days, no breakout. The fee line keeps ticking up.',
        reactor: 'nina',
        line: 'Is this what boring profit feels like?',
      },
      {
        headline: 'Range until the end',
        note: 'The week closes almost where it started. Almost all of the upside was fees.',
        reactor: 'carl',
        line: 'No trend, barely any IL. Just fees. More pools should be like this.',
      },
    ],
  },
];

/**
 * Which pool each scenario rewards with the best net, for the pool-fit bonus.
 * This is a teaching pick, not a guaranteed maximum:
 *  - grind  -> blue-chip: steady fees, IL small enough to beat.
 *  - pump   -> stable: wild ratios on a low-vol pool stay tame; fees are small
 *              but nearly pure profit.
 *  - chop   -> memecoin: no trend means no IL, so the fat fee dial wins.
 */
export const POOL_FIT: Record<ScenarioId, PoolId> = {
  grind: 'bluechip',
  pump: 'stable',
  chop: 'memecoin',
};

export const STORAGE_KEYS = {
  best: 'defi_maxi_pool_party_best',
  aura: 'defi_maxi_pool_party_aura',
  tutorialSeen: 'defi_maxi_pool_party_tut_seen',
};

export const DEFAULT_TRANCHES: Tranche[] = [{ value: POOL_CONFIG.startingDeposit, entryRatio: 1 }];

/* ------------------------------------------------------------------ */
/* Pool / scenario accessors                                           */
/* ------------------------------------------------------------------ */

export function getPool(id: PoolId): Pool {
  return POOLS.find((p) => p.id === id) ?? POOLS[0];
}

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

/** Same seed always returns the same scenario, so a shared link can be replayed. */
export function pickScenarioId(seed: number): ScenarioId {
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * SCENARIOS.length);
  return SCENARIOS[Math.min(idx, SCENARIOS.length - 1)].id;
}

export function scenarioSeed(runCounter: number): number {
  return hashSeed(`pool-party-${runCounter}-${Date.now()}`);
}

/**
 * Scenario price ratios scaled by the pool's volatility dial.
 * r_final(day) = 1 + (r_base(day) - 1) * volFactor.
 * A memecoin pump at base 1.75 becomes 2.2; the same pump on Stable Swap
 * becomes 1.11. Same market story, very different LP experience.
 */
export function adjustedRatios(poolId: PoolId, scenarioId: ScenarioId): number[] {
  const pool = getPool(poolId);
  return getScenario(scenarioId).ratios.map((r) => 1 + (r - 1) * pool.volFactor);
}

/* ------------------------------------------------------------------ */
/* Core AMM math                                                       */
/* ------------------------------------------------------------------ */

/**
 * Impermanent loss as a FRACTION of the HODL baseline, for a single tranche
 * entered at ratio 1:  IL = 2*sqrt(r)/(1+r) - 1.
 * Always <= 0. r=1 -> 0; r=2 or 0.5 -> about -5.7%; r=4 or 0.25 -> -20%.
 */
export function ilPercent(r: number): number {
  if (r <= 0) return -1;
  return (2 * Math.sqrt(r)) / (1 + r) - 1;
}

/** LP value of a set of tranches at price ratio r. */
export function lpValueAt(tranches: Tranche[], r: number): number {
  return tranches.reduce((sum, t) => sum + t.value * Math.sqrt(r / t.entryRatio), 0);
}

/** What the same deposits would be worth held 50/50 OUTSIDE the pool. */
export function hodlValueAt(tranches: Tranche[], r: number): number {
  return tranches.reduce((sum, t) => sum + (t.value * (1 + r / t.entryRatio)) / 2, 0);
}

/**
 * Fees for one day, from the position value at the START of that day.
 * fee = (lpStart / 1000) * pool.feePer1k * scenario.volumeIndex[day].
 * Credited as cash; never compounded back into the pool.
 */
export function feeForDay(
  lpStart: number,
  poolId: PoolId,
  scenarioId: ScenarioId,
  dayIndex: number
): number {
  const pool = getPool(poolId);
  const scenario = getScenario(scenarioId);
  const vi = scenario.volumeIndex[Math.min(dayIndex, scenario.volumeIndex.length - 1)];
  return (lpStart / 1000) * pool.feePer1k * vi;
}

/** LP value at the START of a day (before that day's price move). */
export function dayStartLP(tranches: Tranche[], ratios: number[], dayIndex: number): number {
  const r = dayIndex === 0 ? 1 : ratios[dayIndex - 1];
  return lpValueAt(tranches, r);
}

/* ------------------------------------------------------------------ */
/* Scoring, verdicts, explanation                                      */
/* ------------------------------------------------------------------ */

export function auraFor(score: number): number {
  return Math.max(0, Math.floor(score / POOL_CONFIG.auraPerScore));
}

export function rankFor(score: number): { title: string; blurb: string } {
  const ranks: { min: number; title: string; blurb: string }[] = [
    { min: 0, title: 'Pool Newbie', blurb: 'You showed up and deposited. That is step one.' },
    {
      min: 150,
      title: 'Fee Farmer',
      blurb: 'The fees were real. Keep one eye on the IL column next time.',
    },
    {
      min: 350,
      title: 'Liquidity Local',
      blurb: 'You read the pool and the price action. Solid, unglamorous net.',
    },
    {
      min: 600,
      title: 'Impermanent Insider',
      blurb: 'You knew when fees were worth the IL risk, and when they were not.',
    },
    {
      min: 850,
      title: 'Pool Party Legend',
      blurb: 'Fees in, IL managed, exit timed. This is what good LPing looks like.',
    },
  ];
  let rank = ranks[0];
  for (const r of ranks) {
    if (score >= r.min) rank = r;
  }
  return { title: rank.title, blurb: rank.blurb };
}

export function verdictFor(
  net: number,
  fees: number,
  ilDollars: number,
  priceMovePct: number
): { title: string; blurb: string } {
  const cfg = POOL_CONFIG;
  if (Math.abs(priceMovePct) < cfg.flatThresholdPct && fees > 0 && net > 0) {
    return {
      title: 'Fees stacked, IL slept',
      blurb:
        'The price barely moved, so impermanent loss never showed up. Everything you kept was fees.',
    };
  }
  if (net > cfg.washThreshold) {
    return {
      title: 'Fees saved you',
      blurb: `Fees of about $${Math.round(fees)} beat the $${Math.round(Math.abs(ilDollars))} of impermanent loss.`,
    };
  }
  if (net < -cfg.washThreshold) {
    return {
      title: 'Impermanent loss ate your fees',
      blurb: `The $${Math.round(Math.abs(ilDollars))} IL drag was bigger than the $${Math.round(fees)} you earned in fees.`,
    };
  }
  return {
    title: 'Too close to call',
    blurb: 'Fees and impermanent loss cancelled each other out. Literally a coin flip.',
  };
}

/**
 * Plain-English recap, built from the actual numbers of the run.
 * Always the same shape for the same inputs - no hidden randomness.
 */
export function explainRun(
  pool: Pool,
  scenario: Scenario,
  r: number,
  ilDollars: number,
  fees: number,
  net: number,
  earlyWithdraw: boolean
): string {
  const pct = Math.abs((r - 1) * 100).toFixed(0);
  const poolName = pool.name;
  const dir = r >= 1 ? 'higher' : 'lower';
  const ilAbs = Math.abs(ilDollars);
  const netWord = net >= 0 ? 'ahead' : 'behind';

  const parts: string[] = [];

  if (Math.abs((r - 1) * 100) < POOL_CONFIG.flatThresholdPct) {
    parts.push(
      `The price ended the week almost exactly where it started. A 50/50 pool only drifts away from a plain hold when the price ratio moves, so your impermanent loss stayed near zero.`
    );
    parts.push(
      `That made ${poolName} a fee machine: about $${Math.round(fees)} of trading fees, nearly all of it profit.`
    );
  } else {
    parts.push(
      `The price ended ${pct}% ${dir} than it started. A 50/50 pool sells the token that is rising and buys the one that is falling, so your position drifted about $${Math.round(ilAbs)} below what the same deposits held outside the pool would have been worth. That gap is impermanent loss - it is only "impermanent" if the price comes all the way back, which ${scenario.name.toLowerCase()} did not let it do.`
    );
    if (net >= 0) {
      parts.push(
        `Trading fees of about $${Math.round(fees)} covered that drag and left you roughly $${Math.round(net)} ${netWord} versus just holding.`
      );
    } else {
      parts.push(
        `Fees of about $${Math.round(fees)} were not enough. The IL ran about $${Math.round(-net)} deeper than the fees, so you finished ${netWord} versus a plain hold.`
      );
    }
  }

  if (earlyWithdraw) {
    parts.push('You pulled out early, which locked in the numbers you see instead of riding the rest of the chart.');
  }

  return parts.join(' ');
}

/* ------------------------------------------------------------------ */
/* Full-run simulation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Score a finished (or abandoned) run.
 * score = net * netScale  +  pool-fit bonus  +  smart-exit bonus.
 * Can be negative - a bad LP week is a bad score, and that is the lesson.
 */
export function scoreFor(
  net: number,
  poolId: PoolId,
  scenarioId: ScenarioId,
  smartExit: boolean
): number {
  const fit = POOL_FIT[scenarioId] === poolId;
  const base = Math.round(net * POOL_CONFIG.netScale);
  return (
    base +
    (fit ? POOL_CONFIG.poolFitBonus : 0) +
    (smartExit ? POOL_CONFIG.smartWithdrawBonus : 0)
  );
}

/**
 * Build the full RunResult for a run that ended on `withdrawDay`
 * (0-based). Fees for days 0..withdrawDay are included - the component
 * credits them as each day opens. If the player left before day 5 we also
 * simulate the "stayed to the end" counterfactual for the smart-exit check.
 */
export function simulateRun(
  poolId: PoolId,
  scenarioId: ScenarioId,
  tranches: Tranche[],
  feesSoFar: number,
  withdrawDay: number
): RunResult {
  const pool = getPool(poolId);
  const scenario = getScenario(scenarioId);
  const ratios = adjustedRatios(poolId, scenarioId);
  const wd = Math.max(0, Math.min(withdrawDay, POOL_CONFIG.days - 1));
  const r = ratios[wd];

  const lpValue = lpValueAt(tranches, r);
  const hodlValue = hodlValueAt(tranches, r);
  const ilDollars = lpValue - hodlValue;
  const net = lpValue + feesSoFar - hodlValue;
  const earlyWithdraw = wd < POOL_CONFIG.days - 1;

  // Counterfactual: hold the same tranches to day 5, no more adds.
  let counterfactual: RunResult['counterfactual'] = null;
  let smartExit = false;
  if (earlyWithdraw) {
    let fees = feesSoFar;
    for (let d = wd + 1; d < POOL_CONFIG.days; d++) {
      const startLP = lpValueAt(tranches, ratios[d - 1]);
      fees += feeForDay(startLP, poolId, scenarioId, d);
    }
    const cfLP = lpValueAt(tranches, ratios[POOL_CONFIG.days - 1]);
    const cfHodl = hodlValueAt(tranches, ratios[POOL_CONFIG.days - 1]);
    const cfNet = cfLP + fees - cfHodl;
    const cfWealth = cfLP + fees;
    counterfactual = { lpValue: cfLP, fees, net: cfNet, wealth: cfWealth };
    // Smart exit is a wealth question, not a net-vs-HODL question: leaving with
    // more dollars in hand than staying would have produced. (At a pump peak the
    // net-vs-HODL gap can be largest and the wealth difference still enormous.)
    // Note: `fees` above now includes the counterfactual future fees, so the
    // exit side must use feesSoFar - the fees actually collected by leaving.
    smartExit = lpValue + feesSoFar > cfWealth;
  }

  const score = scoreFor(net, poolId, scenarioId, smartExit);
  const priceMovePct = (r - 1) * 100;

  return {
    poolId,
    scenarioId,
    withdrawDay: wd,
    earlyWithdraw,
    tranches,
    fees: feesSoFar,
    lpValue,
    hodlValue,
    ilDollars,
    net,
    smartExit,
    poolFit: POOL_FIT[scenarioId] === poolId,
    score,
    rank: rankFor(score),
    verdict: verdictFor(net, feesSoFar, ilDollars, priceMovePct),
    explanation: explainRun(pool, scenario, r, ilDollars, feesSoFar, net, earlyWithdraw),
    counterfactual,
    priceMovePct,
  };
}
