import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  LessonSchema,
  GlossaryTermSchema,
  ExploreCardSchema,
  CaseSchema,
} from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const contentDir = path.join(projectRoot, 'content');

console.log(`[Content Validator] Validating content in: ${contentDir}`);

let totalChecked = 0;
let errorsCount = 0;

function validateGlossary() {
  const glossaryPath = path.join(contentDir, 'glossary.json');
  if (!fs.existsSync(glossaryPath)) {
    console.warn(`[Content Validator] Notice: ${glossaryPath} does not exist yet.`);
    return;
  }
  try {
    const raw = fs.readFileSync(glossaryPath, 'utf8');
    const data = JSON.parse(raw);
    const parsed = z.array(GlossaryTermSchema).safeParse(data);
    if (!parsed.success) {
      console.error(`❌ Validation failed in glossary.json:`, parsed.error.format());
      errorsCount++;
    } else {
      console.log(`✅ Validated glossary.json (${parsed.data.length} terms)`);
      totalChecked += parsed.data.length;
    }
  } catch (err) {
    console.error(`❌ Error reading glossary.json:`, err);
    errorsCount++;
  }
}

function validateExploreCards() {
  const explorePath = path.join(contentDir, 'explore-cards.json');
  if (!fs.existsSync(explorePath)) {
    return;
  }
  try {
    const raw = fs.readFileSync(explorePath, 'utf8');
    const data = JSON.parse(raw);
    const parsed = z.array(ExploreCardSchema).safeParse(data);
    if (!parsed.success) {
      console.error(`❌ Validation failed in explore-cards.json:`, parsed.error.format());
      errorsCount++;
    } else {
      console.log(`✅ Validated explore-cards.json (${parsed.data.length} cards)`);
      totalChecked += parsed.data.length;
    }
  } catch (err) {
    console.error(`❌ Error reading explore-cards.json:`, err);
    errorsCount++;
  }
}

function validateLessons(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      validateLessons(fullPath);
    } else if (entry.name.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(raw);
        const parsed = LessonSchema.safeParse(data);
        if (!parsed.success) {
          console.error(`❌ Validation failed in ${entry.name}:`, parsed.error.format());
          errorsCount++;
        } else {
          console.log(`✅ Validated lesson: ${parsed.data.id} - ${parsed.data.title}`);
          totalChecked++;
        }
      } catch (err) {
        console.error(`❌ Error reading ${entry.name}:`, err);
        errorsCount++;
      }
    }
  }
}

function validateCases(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  for (const name of entries) {
    try {
      const raw = fs.readFileSync(path.join(dir, name), 'utf8');
      const data = JSON.parse(raw);
      const parsed = CaseSchema.safeParse(data);
      if (!parsed.success) {
        console.error(`❌ Validation failed in cases/${name}:`, parsed.error.format());
        errorsCount++;
      } else {
        console.log(`✅ Validated case: ${parsed.data.id} - ${parsed.data.title}`);
        totalChecked++;
      }
    } catch (err) {
      console.error(`❌ Error reading cases/${name}:`, err);
      errorsCount++;
    }
  }
}

function readIds(file: string, key = 'id'): Set<string> {
  if (!fs.existsSync(file)) return new Set();
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data)) return new Set();
  return new Set(data.map((x: Record<string, unknown>) => String(x[key])));
}

// Referential integrity: catch ids that are referenced but never defined.
// These pass schema validation (plain string arrays) but silently render nothing.
function checkReferences() {
  const glossaryIds = readIds(path.join(contentDir, 'glossary.json'));
  const cardIds = readIds(path.join(contentDir, 'explore-cards.json'));

  const casesDir = path.join(contentDir, 'cases');
  const caseIds = new Set<string>();
  if (fs.existsSync(casesDir)) {
    for (const name of fs.readdirSync(casesDir).filter((f) => f.endsWith('.json'))) {
      caseIds.add(String(JSON.parse(fs.readFileSync(path.join(casesDir, name), 'utf8')).id));
    }
  }

  const lessonFiles: string[] = [];
  const collect = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith('.json')) lessonFiles.push(full);
    }
  };
  collect(path.join(contentDir, 'lessons'));
  const lessonIds = new Set(lessonFiles.map((f) => JSON.parse(fs.readFileSync(f, 'utf8')).id));

  for (const file of lessonFiles) {
    const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const badTerms = (lesson.glossaryTerms ?? []).filter((t: string) => !glossaryIds.has(t));
    const badCards = (lesson.steps ?? [])
      .filter((s: { type: string }) => s.type === 'explore')
      .flatMap((s: { cardIds?: string[] }) => s.cardIds ?? [])
      .filter((c: string) => !cardIds.has(c));
    const badCases = (lesson.steps ?? [])
      .filter((s: { type: string }) => s.type === 'case')
      .map((s: { caseId?: string }) => s.caseId)
      .filter((c: string | undefined): c is string => !!c && !caseIds.has(c));
    if (badTerms.length || badCards.length || badCases.length) {
      errorsCount++;
      console.error(`❌ [ref] ${lesson.id}: ${badTerms.length ? `unknown glossaryTerms [${badTerms.join(', ')}] ` : ''}${badCards.length ? `unknown cardIds [${badCards.join(', ')}] ` : ''}${badCases.length ? `unknown caseIds [${badCases.join(', ')}]` : ''}`);
    }
  }

  for (const name of fs.readdirSync(casesDir).filter((f) => f.endsWith('.json'))) {
    const c = JSON.parse(fs.readFileSync(path.join(casesDir, name), 'utf8'));
    const badTerms = (c.glossaryTerms ?? []).filter((t: string) => !glossaryIds.has(t));
    const badLessons = (c.lessonIds ?? []).filter((t: string) => !lessonIds.has(t));
    if (badTerms.length || badLessons.length) {
      errorsCount++;
      console.error(`❌ [ref] case ${c.id}: ${badTerms.length ? `unknown glossaryTerms [${badTerms.join(', ')}] ` : ''}${badLessons.length ? `unknown lessonIds [${badLessons.join(', ')}]` : ''}`);
    }
  }
}

validateGlossary();
validateExploreCards();
validateLessons(path.join(contentDir, 'lessons'));
validateCases(path.join(contentDir, 'cases'));
checkReferences();

console.log(`\nValidation complete. Checked ${totalChecked} items.`);
if (errorsCount > 0) {
  console.error(`❌ Found ${errorsCount} validation error(s).`);
  process.exit(1);
} else {
  console.log(`🎉 All content passed schema validation!`);
}
