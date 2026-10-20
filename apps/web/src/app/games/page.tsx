import React from 'react';
import Link from 'next/link';
import { Character } from '@/components/games/Character';
import { BestScore } from '@/components/games/BestScore';
import { ArrowRight, Wrench } from 'lucide-react';

const COMING_SOON = [
  {
    title: 'Pool Party',
    pitch: 'Provide liquidity the hard way, and watch what impermanent loss really does to you.',
  },
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
  title: 'Games - Rekt School',
  description:
    'Play Rug Tycoon, a free browser game that teaches you to spot token launches that are set up to fail.',
};

export default function GamesPage() {
  return (
    <main className="g-hub">
      <header className="g-hub-head">
        <span className="g-hub-kicker">Rekt School Arcade</span>
        <h1 className="g-hub-title">Games</h1>
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
