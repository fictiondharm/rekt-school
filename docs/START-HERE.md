# START HERE (for the owner, not the agent)

## 1. Before you start (do this first, about 1 hour)
- [ ] Create accounts: GitHub, Supabase (free), Vercel (free), Helius (free devnet RPC key)
- [ ] Install Phantom wallet, switch it to **Devnet**
- [ ] Make a second, separate wallet that only **receives payments** (keep its seed phrase offline)
- [ ] Collect devnet SOL from faucets into your Phantom wallet (a little each day; you need several SOL to deploy the swap program)
- [ ] Read the hackathon rules about collecting money and using mainnet
- [ ] Start telling people: "Early access for $1" and keep a spreadsheet (name, date, amount, method, code sent)

## 2. Put the files in the agent's project folder
Copy all files `00` to `06` into a folder named `defi-quest` and open that folder in your coding agent.

## 3. Paste this first prompt
> Read all files in `/defi-quest` in order (00 to 06). File 06 overrides the others. Build **Days 1 to 3** in one run. After each day, run the tests and write a 5-line report, then continue without waiting. Stop after Day 3 with the full report, a public preview URL, and the exact commands to run it.

## 4. After each block
- Run it yourself. Click through as a beginner would.
- Send the agent a list of what is broken, or say "approved".
- Next blocks: Days 4 to 6, then Days 7 to 8, then Days 9 to 10.

## 5. Prompt for fixes
> In Day N, these issues were found: [list]. Fix them without changing other behaviour, add tests that would have caught them, and update the report.

## 6. Rules to remember
- Product first. Payments and the paywall go on at Day 9.
- Feature freeze at the start of Day 9. New ideas go on a "Version 2" list.
- If the real swap is not working by the end of Day 6, use the simulated pool and keep going.
- Keep a backup demo video. Open the app before judging (free databases can pause).

