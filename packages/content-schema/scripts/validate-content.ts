import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  LessonSchema,
  GlossaryTermSchema,
  ExploreCardSchema,
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

validateGlossary();
validateExploreCards();
validateLessons(path.join(contentDir, 'lessons'));

console.log(`\nValidation complete. Checked ${totalChecked} items.`);
if (errorsCount > 0) {
  console.error(`❌ Found ${errorsCount} validation error(s).`);
  process.exit(1);
} else {
  console.log(`🎉 All content passed schema validation!`);
}
