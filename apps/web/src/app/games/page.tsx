import React from 'react';
import Link from 'next/link';
import { Character } from '@/components/games/Character';
import { BestScore } from '@/components/games/BestScore';
import { ArrowLeft, ArrowRight, Wrench } from 'lucide-react';

const COMING_SOON = [
  {
    title: 'Governance Heist',
    pitch: 'Flash-loan your way to a majority vote. Real Beanstalk numbers, real consequences.',
  },
  {
    title: 'Bridge Runner',
    pitch: 'Move value across a bridge you do not fully trust and hope the validators are honest.',
  },
];

export const metadata = {
  title: 'Arcade - Rekt School',
  description:
    'Play Rug Tycoon and Pool Party, free browser games that teach you to spot token launches and liquidity pools that are set up to fail you.',
};

export default function GamesPage() {
  return (
    <main className="g-hub">
      <header className="g-hub-head">
        <Link href="/" className="g-backlink">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <span className="g-hub-kicker">Free to play · no wallet</span>
        <h1 className="g-hub-title">Arcade</h1>
        <p className="g-hub-sub">
          Nothing to install, nothing to connect, nothing to pay for. Each game teaches one thing
          you will wish you had known earlier - by making you the person doing it.
        </p>
      </header>

      <section className="g-grid">
        <Link href="/games/rug-tycoon" className="g-card">
          <div className="g-card-art">
            <Character id="rugsy" mood="buy" size={96} title="Rugsy" />
          </div>
          <h2 className="g-card-title">Rug Tycoon</h2>
          <p className="g-card-pitch">
            Launch a token, buy some fake hype, and try to fool the crowd before they work out
            what the red flags are. Three rounds, no wallet required.
          </p>
          <div className="g-card-meta">
            <span className="g-card-best">
              <BestScore />
            </span>
            <span>
              Play <ArrowRight size={13} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </span>
          </div>
        </Link>

        <Link href="/games/liquidation-line" className="g-card">
          <div className="g-card-art">
            <Character id="liquidator" mood="walk" size={96} title="Liquidator Bot" />
          </div>
          <h2 className="g-card-title">Liquidation Line</h2>
          <p className="g-card-pitch">
            Perpetual futures with leverage over 5 wicked rounds. Candle wicks hunt liquidations.
            Isolated margin, funding, and one line between survival and wipeout.
          </p>
          <div className="g-card-meta">
            <span className="g-card-best">
              <BestScore storageKey="defi_maxi_liquidation_line_best" label="Liquidation Line" />
            </span>
            <span>
              Play <ArrowRight size={13} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </span>
          </div>
        </Link>

        <Link href="/games/pool-party" className="g-card">
          <div className="g-card-art">
            <Character id="nina" mood="walk" size={96} title="Newbie Nina" />
          </div>
          <h2 className="g-card-title">Pool Party</h2>
          <p className="g-card-pitch">
            Provide liquidity for six days and watch what impermanent loss really does to your
            fees. Stay, add, or bail - the pool does not care either way.
          </p>
          <div className="g-card-meta">
            <span className="g-card-best">
              <BestScore storageKey="defi_maxi_pool_party_best" label="Pool Party" />
            </span>
            <span>
              Play <ArrowRight size={13} style={{ display: 'inline', verticalAlign: '-2px' }} />
            </span>
          </div>
        </Link>

        {COMING_SOON.map((g) => (
          <div key={g.title} className="g-card g-card-dead" aria-disabled="true">
            <div className="g-card-art">
              <Wrench size={44} color="#4a4657" />
            </div>
            <h2 className="g-card-title">{g.title}</h2>
            <p className="g-card-pitch">{g.pitch}</p>
            <div className="g-card-meta">
              <span className="g-card-best">Coming soon</span>
              <span>-</span>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

