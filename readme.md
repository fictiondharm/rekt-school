# DeFi Mommy: Learn Solana DeFi by Doing It

> **"DeFi costs beginners real money to learn. Videos don't help. We teach by doing, on Solana Devnet, with the app as the teacher."**

[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-14F195?logo=solana)](https://solana.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tests Passing](https://img.shields.io/badge/Vitest-18%20Passed-green)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

**DeFi Mommy** is an interactive, non-custodial Web3 educational platform designed to onboard users to decentralized finance safely. 

Instead of reading passive documentation or watching YouTube videos, learners interact with live **Solana Devnet** smart contracts and real-time mathematical simulators. The application guides learners with spotlight tours, instant feedback, server-side transaction verifications, and cryptographic certificates of completion.

---

## 🚀 Live Demo & Evaluator Quick Start

### Evaluator Master Invite Codes
For hackathon judges and evaluators, the access gate can be unlocked immediately using any of the following master codes:
- **`JUDGES`**
- **`JUDGES-SOLANA-2026`**
- **`DEMO`**
- **`SOLANA`**

Alternatively, test the native **\$1 USDC Solana Payment Gateway** or the manual UPI fallback directly in the UI.

### Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-org/defi-mommy.git
cd defi-mommy

# 2. Install dependencies with pnpm
pnpm install

# 3. Build all workspace packages and apps
pnpm build

# 4. Start the production server
pnpm --filter web start -p 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧭 Curriculum Map

### Tier 1: Basic Curriculum (Solana Devnet)
- **B1 (Free Preview): Welcome & Spotlight UI Tour** — Guided orientation of dual-panel learning layout, devnet sandbox, and interactive glossary.
- **B2: Your Wallet** — Ed25519 keypair generation, public/private keys, message signing, and seed phrase safety.
- **B3: Stay Safe (Wallet Security)** — Interactive "Spot the Scam" simulator detecting phishing URLs, fake token approvals, and drainer transactions.
- **B4: Gas and Fees on Solana** — Devnet SOL faucet, micro-fee calculations, rent-exempt storage, and block explorer verification.
- **B5: Tokens & Token Accounts** — Associated Token Accounts (ATA), decimals, and receiving faucet test tokens (`fUSDC`).
- **B6: Mint Your Own SPL Token** — Create a custom Solana SPL token with your own name, symbol, supply, and mint authority revocation toggle.
- **B7: Your First AMM Swap** — Execute swaps against an automated market maker pool on Solana Devnet with slippage and price impact protection.
- **B8: Market Cap vs. FDV** — Interactive circulating vs. total supply sliders, unlock schedules, and low-float dilution traps.

### Intermediate Previews & "Wow" Simulators
- **I1 (Free Preview): The Liquidity Lab** — Interactive constant-product curve ($x \cdot y = k$) simulator comparing thin shallow pools vs. deep ocean pools with live price impact.
- **I2: Be the Liquidity Provider** — Deposit token pairs, calculate pool shares, fee yields, and impermanent loss.
- **I3: The Yield Lab** — "Add 100 Users" stress-test demonstrating why astronomical APYs at protocol launch rapidly dilute and collapse.

---

## 🔍 What is Real On-Chain vs. Simulated

| Feature | Execution Type | Description |
|---|---|---|
| **Gas Faucet (`/api/faucet/gas`)** | ⚡ **Real Solana Devnet** | Requests 0.5 devnet SOL transferred directly to the user's wallet via RPC. |
| **fUSDC Faucet (`/api/faucet/token`)** | ⚡ **Real Solana Devnet** | Mints 100 test `fUSDC` tokens into the user's Associated Token Account. |
| **SPL Token Creator (B6)** | ⚡ **Real Solana Devnet** | Deploys real SPL Mint accounts on Solana Devnet with signature verification. |
| **AMM Swaps (B7)** | ⚡ **Real Solana Devnet** | Executes token trades against real devnet reserve accounts. |
| **Task Verifier (`/api/tasks/verify`)** | ⚡ **Real Solana Devnet** | Backend JSON-RPC verifies ledger transactions before granting XP. |
| **Liquidity Lab (I1)** | 🧪 **Pure Math Sandbox** | SVG constant-product curve ($x \cdot y = k$) for instant pedagogical exploration without waiting for block confirmations. |
| **Yield Lab (I3)** | 🧪 **Pure Math Sandbox** | Dilution math calculating reward rates, TVL, and APR collapse when pools saturate. |
| **Phishing Spotter (B3)** | 🧪 **Simulation Sandbox** | Safe, isolated environment to inspect malicious contract calls without endangering real assets. |

---

## ⏱️ 3-Minute Hackathon Presentation Script

1. **The Problem (20s):**
   > *"Learning DeFi costs beginners real money and painful mistakes. Static videos and long docs don't work. We teach by doing on Solana Devnet, with the app as the teacher."*

2. **Login & Spotlight Tour (30s):**
   > *"A beginner opens DeFi Mommy. No browser wallet is required for our free previews. The driver spotlight tour immediately guides them across the interface, explaining core terminology via our built-in 75-term glossary."*

3. **Hands-On Devnet Practice (60s):**
   > *"The user connects Phantom or Solflare. They claim test gas and fUSDC from our devnet faucet, mint their own custom SPL token, and execute a swap on an AMM. Every step is cryptographically verified on-chain by our server before XP is awarded."*

4. **The 'Wow' Simulators (50s):**
   > *"In the Liquidity Lab (I1), students drag the swap slider between shallow and ocean-deep pools to see price impact skyrocket. In the Yield Lab (I3), clicking 'Add 100 Users' instantly demonstrates why 500% APYs collapse in hours."*

5. **Completion & Credential (20s):**
   > *"Upon finishing the curriculum, students claim a verifiable Certificate of Completion with print and PDF support."*

---

## 🏗️ Architecture & Monorepo Structure

```
defi-mommy/
├── apps/
│   └── web/                     # Next.js 15 App Router web application
│       ├── src/app/             # Pages, API routes (/faucet, /tasks, /invite, /payments)
│       ├── src/components/      # Lesson engine, companions, simulators, UI tokens
│       └── src/lib/             # Solana connection, cluster guard, progress store
├── packages/
│   ├── sim-core/                # Pure TypeScript AMM & yield math (18 unit tests)
│   └── content-schema/          # Zod curriculum schemas & validation CLI
├── content/
│   ├── lessons/                 # Curriculum JSON definitions (B1-B8, I1-I3)
│   ├── glossary.json            # 75 defined Solana & DeFi terms
│   └── explore-cards.json       # Verified real-world Solana protocols
├── scripts/
│   └── seed-invites.ts          # Evaluator and single-use invite generator
├── DECISIONS.md                 # Architecture Decision Records (ADR)
└── README.md
```

---

## 🛡️ Security & Disclaimers

- **Devnet Enforcement**: All transactions are strictly restricted to Solana Devnet via `cluster-guard.ts`. Mainnet transactions are strictly rejected in the learning flow.
- **Server-Side Verification**: The client is never trusted for XP or badge awards; all proofs are verified on the Solana ledger.
- **Zero Financial Advice**: DeFi Mommy is an educational tool. All tokens minted are test tokens with zero monetary value.

---

## 📄 License

MIT © 2026 DeFi Mommy Team
