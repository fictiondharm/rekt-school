import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SeedCode {
  code: string;
  max_uses: number;
}

function generateCode(): string {
  // Human-friendly uppercase alphanumeric code e.g. QUEST-A7F2-9K1M
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `QUEST-${part1}-${part2}`;
}

const codes: SeedCode[] = [];

// 1. Hackathon Judges Master Code
codes.push({
  code: 'JUDGES-SOLANA-2026',
  max_uses: 100,
});

// 2. 50 Single-use invite codes
for (let i = 0; i < 50; i++) {
  codes.push({
    code: generateCode(),
    max_uses: 1,
  });
}

// Write to CSV
const csvPath = path.join(__dirname, 'seed-invites.csv');
const csvContent =
  'code,max_uses,used_count\n' +
  codes.map((c) => `${c.code},${c.max_uses},0`).join('\n');

fs.writeFileSync(csvPath, csvContent, 'utf8');

// Write SQL insert script for Supabase
const sqlPath = path.join(__dirname, 'seed-invites.sql');
const sqlValues = codes
  .map((c) => `('${c.code}', ${c.max_uses}, 0)`)
  .join(',\n  ');
const sqlContent = `INSERT INTO invite_codes (code, max_uses, used_count) VALUES\n  ${sqlValues}\nON CONFLICT (code) DO NOTHING;\n`;
fs.writeFileSync(sqlPath, sqlContent, 'utf8');

console.log(`Generated ${codes.length} invite codes!`);
console.log(`CSV saved to: ${csvPath}`);
console.log(`SQL saved to: ${sqlPath}`);
console.log('\nSample codes:');
console.log(`- Judges Master: JUDGES-SOLANA-2026 (100 uses)`);
codes.slice(1, 6).forEach((c, idx) => {
  console.log(`- Single-use ${idx + 1}: ${c.code}`);
});
