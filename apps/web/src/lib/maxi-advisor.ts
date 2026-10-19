/**
 * Maxi Advisor Engine
 * Provides contextual, step-specific hints, CT trench wisdom, and actionable DeFi guidance
 * so every lesson and step has unique, intelligent advice instead of a repeating generic fallback.
 */

import { Step } from '@defi-mommy/content-schema';

interface StepAdviceMap {
  [stepIdOrIndex: string]: string[];
}

interface LessonAdviceMap {
  [lessonId: string]: {
    defaultHints: string[];
    steps?: StepAdviceMap;
  };
}

const LESSON_ADVICE: LessonAdviceMap = {
  B1: {
    defaultHints: [
      'Solana transactions finalize in ~400ms. Devnet lets you test all contracts with zero real money at stake.',
      'Check the top bar to track your Aura. Quiz questions add Aura when you answer correctly and subtract it when you slip up - read the explanations either way, they are the real reward.',
    ],
    steps: {
      'b1-welcome': [
        'Read through the core philosophy: in DeFi you hold your own keys, not a centralized bank or exchange.',
        'Hover over any highlighted words like "Devnet" or "Private Key" to see quick glossary tooltips without losing your spot.',
      ],
      'b1-tour': [
        'Notice the layout: the interactive practice panel stays pinned on your right while the curriculum guides you on the left.',
        'You can collapse the sidebar using the arrow button anytime you need extra screen space for complex charts.',
      ],
      'b1-quiz': [
        'Think about self-custody: if an exchange goes bankrupt (like FTX), they lock you out. But on-chain, your wallet controls your funds directly.',
      ],
    },
  },
  B2: {
    defaultHints: [
      'In Solana, your public key (address) is safe to share, but your private key / seed phrase must never touch the internet.',
      'Always switch your wallet extension (Solflare or Backpack) to Developer / Devnet mode before testing.',
    ],
    steps: {
      'b2-intro': [
        'Think of your public address as your email or Twitter handle, and your private key as the master password.',
        'CT slang check: sharing your private key or signing a blind transaction is how people get "drained" in the trenches.',
      ],
      'b2-explore': [
        'Use the direct download links in the right panel to install Solflare or Backpack from official browser web stores.',
        'Once installed, toggle Network Settings from "Mainnet-Beta" to "Devnet" so you can claim free test tokens.',
        'Click the "Connect & Sign Welcome" button on the right. We sign a real Solana Memo Program message on Devnet!',
        'This proves your wallet can talk directly to Solana validators without spending a single cent of real money.',
      ],
    },
  },
  B3: {
    defaultHints: [
      'Rule #1 of crypto: No genuine admin, support agent, or protocol founder will ever DM you asking for your seed phrase.',
      'Hardware wallets (Ledger/Keystone) keep your private keys physically isolated from internet-connected browser malware.',
    ],
    steps: {
      'b3-intro': [
        'Click the security reveal button on the right to inspect what a 12-word recovery phrase looks like.',
        'Notice the emergency red alert: seed phrases generate ALL your private keys mathematically. Never screenshot or cloud-backup them.',
      ],
      'b3-under-the-hood': [
        'Drainer sites clone legitimate frontend UIs (like Uniswap or Raydium) and ask you to approve "setAuthority" or input your seed. Always verify the domain URL!',
      ],
    },
  },
  B4: {
    defaultHints: [
      'Solana gas fees are measured in lamports (1 SOL = 1,000,000,000 lamports). A typical transaction costs only ~5,000 lamports ($0.0007).',
      'If your transaction fails with an error, check if your wallet has at least 0.01 SOL on Devnet to pay validator compute fees.',
    ],
    steps: {
      'b4-intro': [
        'Unlike Ethereum where gas spikes to $50 during meme coin mania, Solana uses localized fee markets to keep base fees fractions of a penny.',
      ],
      'b4-explore': [
        'Use the Faucet Guide on the right: copy your wallet address and paste it into faucet.solana.com or QuickNode for 1 free Devnet SOL.',
        'Our balance tracker will auto-detect your new balance as soon as the Solana validator cluster confirms the airdrop!',
        'Click "Execute Devnet Self-Transfer" to send 0.001 SOL to yourself and measure the exact network fee deducted on-chain.',
      ],
    },
  },
  B5: {
    defaultHints: [
      'Unlike Ethereum ERC-20 where a single contract stores balances in a mapping, Solana uses Associated Token Accounts (ATAs).',
      'Each token you hold (like USDC or BONK) gets its own separate on-chain account owned by the SPL Token Program.',
    ],
    steps: {
      'b5-under-the-hood': [
        'Your ATA address is derived deterministically from your wallet address + the Token Mint address using Program Derived Addresses (PDAs).',
      ],
      'b5-explore': [
        'Claim fUSDC using the faucet card on the right. Notice how the transaction creates your fUSDC ATA and funds it with tokens.',
      ],
    },
  },
  B6: {
    defaultHints: [
      'Deploying a token on Solana takes less than 3 seconds using the SPL Token Program.',
      'Contract Address (CA) is the unique on-chain public key of the Token Mint account.',
    ],
    steps: {
      'b6-under-the-hood': [
        'A Token Mint account stores total supply, decimal precision (usually 6 for USDC, 9 for SOL), and the mint authority public key.',
      ],
      'b6-explore': [
        'Click "Mint 10,000 Custom Tokens" on the right. We initialize a real on-chain mint account on Devnet and mint supply directly to your wallet ATA!',
        'Copy your new Token CA and inspect it on Solana Explorer to see the live on-chain mint authority.',
      ],
    },
  },
  B7: {
    defaultHints: [
      'AMM swaps do not use an order book. You trade directly against a smart contract vault holding both tokens.',
      'Constant product formula x * y = k ensures liquidity is available at every single price point along the curve.',
    ],
    steps: {
      'b7-under-the-hood': [
        'When you sell SOL for fUSDC, you add SOL to the pool and take out fUSDC. This increases the pool ratio and moves the spot price.',
      ],
      'b7-explore': [
        'Test a swap using the simulator or the on-chain Memo trade logger on the right to see execution slippage in action.',
      ],
    },
  },
  B8: {
    defaultHints: [
      'Market Cap = Circulating Supply × Current Price.',
      'FDV (Fully Diluted Valuation) = Total Max Supply × Current Price.',
      'CT Trench Rule: If Circulating Supply is 5% and FDV is $2 Billion, beware of massive insider token unlocks dumping on retail!',
    ],
    steps: {
      'b8-fdv': [
        'Drag the circulating supply slider on the right to observe how low-float tokens create an illusion of high market cap.',
      ],
    },
  },
  B9: {
    defaultHints: [
      'TVL (Total Value Locked) measures the total dollar value of crypto deposited inside a protocol.',
      'Beware of double-counting: if SOL is staked into mSOL and deposited into Kamino, headline TVL counts the same capital twice!',
    ],
    steps: {
      'b9-misleading': [
        'Mercenary yield farmers deposit millions for short-term incentives and pull their liquidity the moment reward emissions dry up.',
      ],
    },
  },
  B10: {
    defaultHints: [
      'Before buying any new token in the trenches, check its Mint Authority and Freeze Authority.',
      'If Freeze Authority is active, the creator can blacklist your wallet and prevent you from ever selling your tokens (honeypot)!',
    ],
    steps: {
      'b10-red-flags': [
        'Legitimate DeFi tokens revoke both mint and freeze authorities so no one can print infinite tokens or freeze user balances.',
      ],
    },
  },
  I1: {
    defaultHints: [
      'In a constant product AMM (x * y = k), large trade sizes relative to pool reserves cause exponential slippage.',
      'Compare execution price against the initial spot price to measure true price impact.',
    ],
    steps: {
      'i1-simulator': [
        'Notice how a 50 SOL trade in a 100 SOL pool produces massive price impact, whereas in a 10,000 SOL pool it executes almost seamlessly.',
      ],
    },
  },
  I2: {
    defaultHints: [
      'Liquidity Providers (LPs) deposit equal dollar values of both pool tokens and receive LP tokens as their proportional share.',
      'Every 0.3% swap fee is deposited straight into the pool vault, so each LP token quietly becomes redeemable for more tokens over time.',
    ],
    steps: {
      'i2-intro': [
        'Hover over the underlined words like "AMM", "Liquidity Pool", and "LP Token" to pop open plain-English glossary tooltips without losing your spot.',
        'The pool is a balanced scale: you deposit equal dollar values so arbitrage bots cannot instantly tilt it against the earliest depositors.',
        'Over in the right-hand LP Lab, tap the "Tour" button to spotlight each control: deposit inputs, your LP token receipt, and the deposit button.',
      ],
      'i2-fees': [
        'Fee math in one line: more swap volume hitting your pool = faster vault growth = your LP tokens redeem for more.',
        'Burning your LP tokens returns your proportional slice of the CURRENT reserves - original capital plus fees, minus any price-ratio drift.',
      ],
      'i2-quiz': [
        'For the percentage question, divide YOUR LP tokens by TOTAL LP supply first, then multiply that fraction by the fee pool.',
        'Swaps are not zero-sum: input tokens plus their fee enter the reserves and output tokens leave. Always trace the reserves, not the headlines.',
      ],
    },
  },
  I3: {
    defaultHints: [
      'APR is simple annual interest without compounding. APY accounts for compound reinvestment frequency.',
      'Hyper-inflationary farm APYs (e.g. 5,000%) collapse rapidly as new farmers dilute the reward emission pool.',
    ],
  },
  I4: {
    defaultHints: [
      'Impermanent Loss (IL) happens whenever the price ratio between the two pooled tokens changes after you deposit.',
      'If the tokens return to their original price ratio when you withdraw, your Impermanent Loss becomes zero.',
    ],
  },
  I5: {
    defaultHints: [
      'Algorithmic stablecoins without real collateral (like Terra/UST) are prone to reflexive bank runs and death spirals.',
      'Overcollateralized stablecoins (like DAI or Kamino USD) require borrowers to lock $1.30+ of assets for every $1.00 borrowed.',
    ],
  },
  I6: {
    defaultHints: [
      'Kinked rate models keep borrow rates low until optimal utilization (U = 80%), then skyrocket along Slope 2 to protect pool solvency.',
      'Try the "Bank Run 96%" preset in the lab to see how emergency borrow rates incentivize immediate debt repayment.',
    ],
  },
  I7: {
    defaultHints: [
      'Health Factor = (Collateral Value × Liquidation Threshold) / Borrowed Debt. If HF < 1.0, you can be liquidated.',
      'MEV bots constantly watch the mempool and RPC nodes to seize undercollateralized positions for a 5% to 10% arbitrage bonus.',
    ],
  },
  I8: {
    defaultHints: [
      'Remember that Solana LST tokens do not rebase; their exchange rate in SOL climbs automatically every epoch (1 LST = (1 + r) SOL).',
      'If you ever spot an LST trading at a 5% discount on Raydium during market panic, patient stakers can buy and unstake natively for risk-free arbitrage.',
    ],
    steps: {
      'i8-pos-intro': [
        'Solana inflation starts at 8% and decreases by 15% each year until it hits a terminal rate of 1.5%.',
        'Check validator commissions: a 0% commission validator passes 100% of staking yield to delegators.',
      ],
      'i8-depeg-risk': [
        'Notice the difference between protocol redemption and AMM spot price: unstaking takes 1 epoch (~2-3 days), but swapping on Jupiter is instant.',
      ],
    },
  },
  I9: {
    defaultHints: [
      'Always look at FDV, not just Market Cap. Low float with high FDV is the #1 way retail gets diluted in bull markets.',
      'A healthy project has at least 15% circulating float on Day 1 and caps total insider allocations under 35%.',
    ],
    steps: {
      'i9-low-float-trap': [
        'Trench rule: if founders and VCs own 80% and the token has a 6-month cliff, expect severe sell pressure at Month 6.',
      ],
      'i9-vesting-cliffs': [
        'Look for projects using continuous per-second streaming vesting (like Streamflow) rather than massive episodic monthly cliff dumps.',
      ],
    },
  },
  I10: {
    defaultHints: [
      'Calculate upcoming monthly unlock value and compare it against the token pool depth on Orca or Raydium.',
      'If an unlock is $10M and the total pool depth is only $2M, constant product pricing dictates a devastating drawdown.',
    ],
    steps: {
      'i10-pool-depth': [
        'Play with the AMM Pool Depth selector in the lab to see how deep liquidity cushions against large sell walls.',
      ],
    },
  },
  P1: {
    defaultHints: [
      'Market orders guarantee a fill, never a good price. Limit orders guarantee the price, never a fill - you become the patient maker.',
      'On a real desk, the maker fee is often 5x cheaper than the taker fee. Over hundreds of trades that gap is the edge.',
    ],
  },
  P2: {
    defaultHints: [
      'An order book punishes size in steps; an AMM punishes it in a smooth curve. Both are governed by depth.',
      'Spread (best ask − best bid) is a hidden cost you pay on entry AND exit even if price never moves.',
    ],
  },
  P3: {
    defaultHints: [
      'Liquidation distance is roughly 1/leverage from entry. At 10x that is 10%; at 20x only 5%.',
      'Leverage multiplies the percentage move applied to YOUR equity, not the position - that is why ordinary wiggle becomes ruin.',
    ],
  },
  P4: {
    defaultHints: [
      'Positive funding = longs pay shorts. Delta-neutral desks are short the perp to collect it.',
      'Mark price blends the perp with a spot index and is smoothed - liquidations use mark, not the last wild candle.',
    ],
  },
  P5: {
    defaultHints: [
      'A flash loan needs no collateral because it must be repaid in the same transaction - it amplifies whatever weakness already exists.',
      'The whole attack dies if manipulating the price costs more than the exploit yields. Robust oracles make lying expensive.',
    ],
  },
  P6: {
    defaultHints: [
      'Your slippage tolerance is literally the maximum a sandwich bot can steal while you still fill. Tighten it.',
      'Private routing hides your intent; splitting size and using limit orders leaks less information to MEV searchers.',
    ],
  },
  P7: {
    defaultHints: [
      'Concentration multiplies fee share AND impermanent loss. Out of range = zero fees and ~100% one token.',
      'Headline TVL includes out-of-range capital that is earning nothing right now.',
    ],
  },
  P8: {
    defaultHints: [
      'Lock-and-mint reduces to two questions: who can mint, and who holds the locked pool?',
      'Rate limits and timelocks turn a catastrophic instant drain into a survivable slow bleed.',
    ],
  },
  P9: {
    defaultHints: [
      'A bonding curve is a pricing machine, not a store of value - one trader\'s gain is literally another\'s deposit.',
      'A rug or honeypot makes your downside 100% while your upside still depends on later buyers arriving.',
    ],
  },
  P10: {
    defaultHints: [
      'Audit the trust surface, not the code: mint, pause, upgrade, withdraw, and the price source.',
      'One fatal lever (lone upgrade key, mint authority, manipulable oracle) caps the whole protocol - real failures are the weakest link, not the average.',
    ],
  },
  P11: {
    defaultHints: [
      'A 50% loss needs a +100% gain to recover. The needed gain is loss/(1−loss). At 100% loss, recovery is impossible.',
      'Kelly = W − (1−W)/R. Bet half-Kelly or less; over-betting turns a positive edge into ruin through volatility drag.',
    ],
  },
  P12: {
    defaultHints: [
      'Every design choice is a trade-off. Ask which lever can take all the money, and who controls it.',
      'A self-consistent protocol beats a clever one: conservative defaults that survive even when one assumption breaks.',
    ],
  },
};

/**
 * Returns contextual Maxi hints and trench wisdom for any lesson step.
 */
export function getMaxiAdvice(
  lessonId: string,
  step: Step,
  stepIndex: number
): string[] {
  // 1. Check if step explicitly provides hints in content JSON
  if ('hints' in step && Array.isArray((step as any).hints) && (step as any).hints.length > 0) {
    return (step as any).hints;
  }

  const upperLesson = lessonId.toUpperCase();
  const lessonData = LESSON_ADVICE[upperLesson];

  if (lessonData) {
    // 2. Check if step ID matches custom advice
    if (lessonData.steps && step.id && lessonData.steps[step.id]) {
      return lessonData.steps[step.id];
    }

    // 3. Check by step type
    if (step.type === 'quiz') {
      return [
        `Pro Tip: Read the question carefully! Focus on the underlying on-chain mechanism taught in the previous step.`,
        `Think through how an on-chain validator or smart contract evaluates the transaction before submitting your answer.`,
      ];
    }

    if (step.type === 'simulator') {
      return [
        `Sandbox Insight: Try moving the inputs to both extremes to see how the mathematical curve behaves under stress!`,
        `Notice the feedback metrics updating live. In DeFi, math never lies: code is law.`,
      ];
    }

    // 4. Return lesson default hints
    if (lessonData.defaultHints && lessonData.defaultHints.length > 0) {
      return lessonData.defaultHints;
    }
  }

  // 5. Dynamic fallback based on step type and title
  if (step.type === 'quiz') {
    return [
      `Knowledge Check: Test your understanding! Consider what happens to user funds and security permissions in this scenario.`,
    ];
  }

  if (step.type === 'simulator') {
    return [
      `Interactive Lab: Experiment with different values in the simulator on the right to see the exact formula in action.`,
    ];
  }

  return [
    `Tactical Insight: Focus on "${step.title}". Understanding this mechanism protects your capital in live markets!`,
    `Review key terms by hovering over the underlined words, then explore the practice panel on the right.`,
  ];
}
