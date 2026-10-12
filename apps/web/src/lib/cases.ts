import mangoMarketsData from '../../../../content/cases/mango-markets.json';
import wormholeData from '../../../../content/cases/wormhole.json';
import cashioData from '../../../../content/cases/cashio.json';
import { Case } from '@defi-mommy/content-schema';

export const CASES: Case[] = [
  mangoMarketsData as unknown as Case,
  wormholeData as unknown as Case,
  cashioData as unknown as Case,
];

export const CASES_MAP: Record<string, Case> = {};
CASES.forEach((c) => {
  CASES_MAP[c.id] = c;
});

export function getAllCases(): Case[] {
  return CASES;
}

export function getCase(id: string): Case | undefined {
  return CASES_MAP[id];
}
