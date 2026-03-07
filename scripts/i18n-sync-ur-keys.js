/**
 * Sync translation keys from lang/en/*.json to lang/ur/*.json
 * - Existing keys in ur keep their (Urdu) value.
 * - New keys (present in en but not in ur) get the English value as placeholder so you can translate later.
 *
 * Usage: node scripts/i18n-sync-ur-keys.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const enDir = path.join(projectRoot, 'lang', 'en');
const urDir = path.join(projectRoot, 'lang', 'ur');

function deepMergeKeys(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMergeKeys(target[key], source[key]);
    } else {
      if (target[key] === undefined) target[key] = source[key];
    }
  }
}

function main() {
  if (!fs.existsSync(enDir)) {
    console.log('lang/en not found.');
    return;
  }
  if (!fs.existsSync(urDir)) fs.mkdirSync(urDir, { recursive: true });

  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const enPath = path.join(enDir, file);
    const urPath = path.join(urDir, file);
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    let ur = {};
    if (fs.existsSync(urPath)) {
      try {
        ur = JSON.parse(fs.readFileSync(urPath, 'utf8'));
      } catch (_) {}
    }
    deepMergeKeys(ur, en);
    fs.writeFileSync(urPath, JSON.stringify(ur, null, 2), 'utf8');
    console.log('Synced', file);
  }
  console.log('Done. Translate new keys in lang/ur/*.json (values copied from EN).');
}

main();
