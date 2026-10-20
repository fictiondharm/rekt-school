import React from 'react';
import { PoolParty } from '@/components/games/PoolParty';

export const metadata = {
  title: 'Pool Party - Rekt School',
  description:
    'Provide liquidity for six days and watch what impermanent loss really does to your fees. A free browser game about the other half of the LP trade.',
};

export default function PoolPartyPage() {
  return <PoolParty />;
}
