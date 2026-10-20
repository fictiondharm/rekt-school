/**
 * Rug Tycoon - game configuration, seeded randomness, investor rules and scoring.
 *
 * Everything balance-related lives in RUG_CONFIG so it can be tweaked in one place.
 * Reports can talk about "no single setting always wins" - the numbers below are the
 * dials that keep it that way (keeping mint/freeze raises your take but scares away
 * the careful money).
 */

export type InvestorType = 'carl' | 'fiona' | 'harry' | 'wanda' | 'nina';
export type Mood = 'buy' | 'walk';

export interface RugSettings {
  /** Player's share of total supply, percent (costs nothing but scares careful buyers). */
  supplyShare: number;
  /** Liquidity the player seeds. Costs budget. */
  liquidity: number;
  /** Whether the player kept the mint authority. */
  mintAuthority: boolean;
  /** Whether the player kept the freeze authority. */
  freezeAuthority: boolean;
  /** Fake hype the player bought. Costs budget. */
  hype: number;
}

export interface InvestorDecision {
  id: string;
  type: InvestorType;
  buys: boolean;
  /** The exact reason shown in the walk-away speech bubble. */
  reason: string;
  /** Real lesson route id ('b6' | 'b8' | 'b9' | 'b10' ...). */
  lessonId: string;
}

export interface RoundResult {
  round: number;
  buyers: number;
  take: number;
  score: number;
}

export const RUG_CONFIG = {
  budget: 10000,
  rounds: 3,
  crowdSize: 20,
  revealMs: 100,

  share: { min: 5, max: 95, step: 5 },
  liquidity: { min: 0, max: 8000, step: 500 },
  hype: { min: 0, max: 4000, step: 500 },

  thresholds: {
    /** Careful Carl buys only below this supply share (with both authorities revoked). */
    carefulMaxShare: 20,
    /** FOMO Fiona buys above this hype, ignoring everything else. */
    fionaMinHype: 2500,
    /** Hype Harry needs this much hype... */
    harryMinHype: 1500,
    /** ...and a supply share below this. */
    harryMaxShare: 50,
    /** Whale Wanda needs this much liquidity (and the mint revoked). */
    wandaMinLiquidity: 3000,
    /** Newbie Nina "follows hype" (random). */
    ninaMinHype: 1500,
    ninaBuyChanceHype: 0.7,
    ninaBuyChanceNoHype: 0.2,
  },

  take: {
    /** Each fooled investor puts in this much. */
    perInvestorInvest: 500,
    /** Base profit you extract per fooled investor. */
    baseTake: 250,
    /** Added per fooled investor if the mint authority stayed live. */
    mintBonus: 200,
    /** Added per fooled investor if the freeze authority stayed live. */
    freezeBonus: 120,
    /** Added per fooled investor per point of supply share. */
    shareFactor: 6,
  },

  /** Aura earned per RUG_CONFIG.auraPerScore points of score. */
  auraPerScore: 500,

  /** Crowd composition per round - later rounds get more careful buyers. */
  composition: [
    { carl: 3, fiona: 6, harry: 4, wanda: 3, nina: 4 },
    { carl: 5, fiona: 4, harry: 3, wanda: 5, nina: 3 },
    { carl: 7, fiona: 2, harry: 3, wanda: 6, nina: 2 },
  ] as Record<InvestorType, number>[],

  /** Rank titles, ascending - the highest `min` below the score wins. */
  ranks: [
    { min: 0, title: 'Rekt Rookie', blurb: 'You launched... and immediately got sued by hindsight.' },
    { min: 8000, title: 'Side-Hustle Scammer', blurb: 'A tidy little grift. The authorities stayed on, so did the suspicion.' },
    { min: 18000, title: 'Certified Smooth Talker', blurb: 'You can talk a crowd into almost anything - well, the reckless half of it.' },
    { min: 32000, title: 'Rug Tycoon', blurb: 'Now this is a rug. Strong numbers, and only the careful ones saw through it.' },
    { min: 48000, title: 'Legendary Leverpull', blurb: 'A masterpiece of fake hype. You fooled the fools and the cautious too.' },
  ],
} as const;

export const INVESTOR_META: Record<InvestorType, { name: string; blurb: string }> = {
  carl: { name: 'Careful Carl', blurb: 'Reads the contract before buying. Revoked authorities or bust.' },
  fiona: { name: 'FOMO Fiona', blurb: 'Only cares that everyone else is buying.' },
  harry: { name: 'Hype Harry', blurb: 'Chases momentum - as long as the float looks fair.' },
  wanda: { name: 'Whale Wanda', blurb: 'Big size. Needs deep liquidity and a dead mint key.' },
  nina: { name: 'Newbie Nina', blurb: 'Goes wherever the vibes go. Coin flip.' },
};

/* ------------------------------------------------------------------ */
/* Seeded randomness                                                   */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Same settings in the same round always produce the same crowd. */
export function seedForRound(round: number, s: RugSettings): number {
  return hashSeed(
    `${round}|${s.supplyShare}|${s.liquidity}|${s.mintAuthority ? 1 : 0}|${
      s.freezeAuthority ? 1 : 0
    }|${s.hype}`
  );
}

/* ------------------------------------------------------------------ */
/* Investor rules                                                      */
/* ------------------------------------------------------------------ */

function decideInvestor(
  type: InvestorType,
  s: RugSettings,
  rng: () => number
): { buys: boolean; reason: string; lessonId: string } {
  const t = RUG_CONFIG.thresholds;

  if (type === 'carl') {
    const clean = !s.mintAuthority && !s.freezeAuthority && s.supplyShare < t.carefulMaxShare;
    if (clean) {
      return {
        buys: true,
        reason: 'Mint and freeze revoked, and you kept your share low. Clean launch - I am in.',
        lessonId: 'b10',
      };
    }
    if (s.mintAuthority) {
      return { buys: false, reason: 'Mint authority was still active, no thanks.', lessonId: 'b6' };
    }
    if (s.freezeAuthority) {
      return { buys: false, reason: 'You could freeze my wallet. Hard pass.', lessonId: 'b10' };
    }
    return {
      buys: false,
      reason: `You're holding ${s.supplyShare}% of the supply yourself - too much skin you won't be selling at my expense.`,
      lessonId: 'b8',
    };
  }

  if (type === 'fiona') {
    if (s.hype > t.fionaMinHype) {
      return { buys: true, reason: 'Everyone is talking about it - I am in, do not care how.', lessonId: 'b10' };
    }
    return { buys: false, reason: 'Not enough hype. This is boring.', lessonId: 'b10' };
  }

  if (type === 'harry') {
    if (s.hype > t.harryMinHype && s.supplyShare < t.harryMaxShare) {
      return { buys: true, reason: 'Decent hype and you do not own the whole float. I ride.', lessonId: 'b8' };
    }
    if (s.supplyShare >= t.harryMaxShare) {
      return {
        buys: false,
        reason: `You hold ${s.supplyShare}% of supply - too concentrated, your dump would crush me.`,
        lessonId: 'b8',
      };
    }
    return { buys: false, reason: 'Hype is too weak, I need real momentum.', lessonId: 'b10' };
  }

  if (type === 'wanda') {
    if (s.liquidity > t.wandaMinLiquidity && !s.mintAuthority) {
      return { buys: true, reason: 'Deep enough pool and no mint key. I can move size here.', lessonId: 'b9' };
    }
    if (s.mintAuthority) {
      return {
        buys: false,
        reason: 'Mint authority still live. I do not put size in a pool with a print button.',
        lessonId: 'b6',
      };
    }
    return { buys: false, reason: 'Liquidity is too thin to absorb my order.', lessonId: 'b9' };
  }

  // nina
  const p = s.hype > t.ninaMinHype ? t.ninaBuyChanceHype : t.ninaBuyChanceNoHype;
  if (rng() < p) {
    return { buys: true, reason: 'The vibes felt good, I guess?', lessonId: 'b10' };
  }
  return { buys: false, reason: 'Vibes felt off, I am sitting this one out.', lessonId: 'b10' };
}

/** Deterministic crowd for a round: composition + shuffle + decisions all from one seed. */
export function buildCrowd(round: number, s: RugSettings): InvestorDecision[] {
  const rng = mulberry32(seedForRound(round, s));
  const comp = RUG_CONFIG.composition[Math.min(round, RUG_CONFIG.composition.length - 1)];

  const types: InvestorType[] = [];
  (Object.keys(comp) as InvestorType[]).forEach((type) => {
    for (let i = 0; i < comp[type]; i++) types.push(type);
  });

  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  return types.map((type, idx) => {
    const d = decideInvestor(type, s, rng);
    return { id: `${round}-${idx}-${type}`, type, ...d };
  });
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

export function takePerInvestor(s: RugSettings): number {
  const take = RUG_CONFIG.take;
  let t = take.baseTake + s.supplyShare * take.shareFactor;
  if (s.mintAuthority) t += take.mintBonus;
  if (s.freezeAuthority) t += take.freezeBonus;
  return Math.round(t);
}

export function amountTaken(buyers: number): number {
  return buyers * RUG_CONFIG.take.perInvestorInvest;
}

export function roundScore(buyers: number, s: RugSettings): number {
  return buyers * takePerInvestor(s);
}

export function auraFor(score: number): number {
  return Math.max(0, Math.floor(score / RUG_CONFIG.auraPerScore));
}

export function rankFor(score: number): { title: string; blurb: string } {
  let rank: { min: number; title: string; blurb: string } = RUG_CONFIG.ranks[0];
  for (const r of RUG_CONFIG.ranks) {
    if (score >= r.min) rank = r;
  }
  return { title: rank.title, blurb: rank.blurb };
}

export const DEFAULT_SETTINGS: RugSettings = {
  supplyShare: 50,
  liquidity: 3000,
  mintAuthority: true,
  freezeAuthority: true,
  hype: 2000,
};

export const STORAGE_KEYS = {
  best: 'defi_maxi_rug_tycoon_best',
  aura: 'defi_maxi_rug_tycoon_aura',
  tutorialSeen: 'defi_maxi_rug_tycoon_tut_seen',
};
