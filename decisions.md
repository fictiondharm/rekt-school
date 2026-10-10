# DECISIONS.md

This file logs architecture and design decisions made during the build of DeFi Quest.
Format: Date | Decision | Reason

| Date | Decision | Reason |
|---|---|---|
| 2026-10-06 | Product Name: "DeFi Quest" | Default specified in 00-READ-FIRST.md |
| 2026-10-06 | Package Manager: pnpm workspaces | Monorepo layout required in 03-SYSTEM-DESIGN.md |
| 2026-10-06 | Styling: Tailwind CSS with CSS design variables | Matches 04-UI-UX-DESIGN tokens with light-first theme |
| 2026-10-06 | Sim Core: Pure TypeScript with Vitest | Non-negotiable rule 5 from 00-READ-FIRST: pure TS math with unit tests |
| 2026-10-06 | Access Gate: ACCESS_GATE_ENABLED=false by default | Hackathon Override rule: product first, paywall enabled on Day 9 |
| 2026-10-06 | Cluster Guard: Enforce devnet in all Solana interactions | Non-negotiable rule 2: devnet only |
| 2026-10-06 | Invite Codes: Multi-code master support (JUDGES, SOLANA, DEMO) | Prevents evaluator lock-out during hackathon judging |
| 2026-10-06 | Dual Unlock Flow: Invite code + $1 USDC modal | Provides seamless unlocking directly from home page or lesson lock walls |
| 2026-10-06 | Clickable Lesson Cards | Locked lessons navigate to lesson preview instead of unclickable disabled buttons |
| 2026-10-06 | Institutional Money Market & Liquidation Engine | Implemented piecewise kink curve ($U, R_0, R_1, R_2$) and Health Factor liquidation math in sim-core |
| 2026-10-06 | Official Faucet Self-Reliance Onboarding | Directs users to official Solana and QuickNode testnet faucets with live balance polling |
| 2026-10-06 | Real Solana Devnet Transactions for B4 & B7 | Replaced mock strings with live wallet signing and verified Solana Explorer links |
| 2026-10-07 | Mommy Trench Advisor Overhaul | Replaced static hardcoded fallback string with dynamic context-aware Mommy advice engine (`apps/web/src/lib/mommy-advisor.ts`) providing tailored tips, CT trench wisdom, and actionable guidance for every lesson and step |
| 2026-10-08 | Staking & Tokenomics Simulation Engines (I8-I10) | Implemented pure TS PoS inflation compounding, LST exchange rate appreciation & depeg arbitrage, tokenomics health score rubric, and AMM cliff sell pressure simulation in sim-core with 37 passing unit tests |
| 2026-10-08 | Pure Deep vs Shallow AMM in LiquidityLab (I1) | Preserved pure constant-product ($400k vs $4k TVL) depth comparison in LiquidityLab for Lesson I1 free preview clarity; isolated 4-token market bursts and fee claiming into standalone MultiTokenPoolLab (`/labs/multi-pool`) |
| 2026-10-08 | Completed Full Tier 2 Curriculum (I11-I14) | Implemented Launch due-diligence engine (I11), Historical Exploit post-mortem debugger (I12), On-Chain SPL mint authority & holder analyzer (I13), and DAO flash-loan & airdrop simulator (I14) with 123 validated content items |



