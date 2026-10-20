import React from 'react';
import { LiquidationLine } from '@/components/games/LiquidationLine';

export const metadata = {
  title: 'Liquidation Line - Rekt School',
  description:
    'Perpetual futures with leverage. Trade over 5 rounds, survive the wicks, learn why liquidation works. Not trading advice.',
};

export default function LiquidationLinePage() {
  return <LiquidationLine />;
}