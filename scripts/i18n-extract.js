/**
 * i18n Extract Script
 * Scans JSX/TSX files for hardcoded UI strings and outputs a report + optional JSON updates.
 *
 * Usage:
 *   node scripts/i18n-extract.js                    # report only
 *   node scripts/i18n-extract.js --update-json      # report + merge suggested keys into lang/en/*.json
 *   node scripts/i18n-extract.js --dir=resources/js/Pages/Accounts  # limit to one folder
 *
 * Output:
 *   scripts/i18n-extract-report.json  (file, line, string, suggestedKey, namespace)
 *   If --update-json: merges new keys into lang/en/accounts.json (and inventory, system) by path.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const OPTS = {
  dir: process.argv.find(a => a.startsWith('--dir='))?.slice(6) || 'resources/js/Pages',
  updateJson: process.argv.includes('--update-json'),
};

const SRC_DIR = path.join(projectRoot, OPTS.dir);

// Map path segment to lang namespace (file) and key prefix
function pathToNamespace(relativePath) {
  // e.g. resources/js/Pages/Accounts/CashVoucher/Create.jsx -> accounts, accounts.cash_voucher.create
  const normalized = relativePath.replace(/\.(jsx|tsx)$/, '').replace(/\\/g, '/');
  const withoutPages = normalized.replace(/^resources[\/\\]js[\/\\]Pages[\/\\]?/i, '').replace(/\\/g, '/');
  const parts = withoutPages.split('/').filter(Boolean);
  const first = (parts[0] || 'app').toLowerCase().replace(/-/g, '_');
  const rest = parts.slice(1).map(p => p.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''));
  const keyPrefix = [first, ...rest].join('.');
  let namespace = first;
  if (first === 'accounts') namespace = 'accounts';
  else if (first === 'inventory') namespace = 'inventory';
  else if (first === 'system') namespace = 'system';
  else if (first === 'reports' || first === 'logs') namespace = first;
  else namespace = 'pages';
  return { namespace, keyPrefix };
}

function slug(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 40) || 'label';
}

function shouldSkip(str) {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim();
  if (s.length < 2 || s.length > 120) return true;
  if (/^\d+$/.test(s)) return true;
  if (s.includes('${') || s.includes('{ ') || s.startsWith('{')) return true;
  if (/^[\s\-\*\.\,\:]+$/.test(s)) return true;
  if (s.startsWith('http') || s.startsWith('api/') || s.includes('className')) return true;
  if (/\|\||\)\.|\.length|=>|\.map\(|\.filter\(/.test(s)) return true;
  return false;
}

function extractFromFile(filePath, content) {
  const relPath = path.relative(projectRoot, filePath);
  const { namespace, keyPrefix } = pathToNamespace(relPath);
  const results = [];
  const lines = content.split(/\r?\n/);

  // placeholder="..." or placeholder='...'
  const attrRegex = /(?:placeholder|title|aria-label|alt)=["']([^"']+)["']/g;
  // Short JSX text: >Label</ or >Some text</ (single line, no {)
  const jsxTextRegex = />\s*([A-Za-z][^<{]*?)</g;

  lines.forEach((line, zeroIndex) => {
    const lineNum = zeroIndex + 1;
    let m;
    attrRegex.lastIndex = 0;
    while ((m = attrRegex.exec(line)) !== null) {
      const [, value] = m;
      if (shouldSkip(value)) continue;
      const keyPart = slug(value);
      results.push({
        file: relPath,
        line: lineNum,
        string: value,
        suggestedKey: `${keyPrefix}.${keyPart}`,
        namespace,
        kind: 'attr',
      });
    }
    // Reset regex for new line
    jsxTextRegex.lastIndex = 0;
    while ((m = jsxTextRegex.exec(line)) !== null) {
      const [, value] = m;
      const trimmed = value.trim();
      if (shouldSkip(trimmed)) continue;
      if (trimmed.length > 80) continue;
      const keyPart = slug(trimmed);
      results.push({
        file: relPath,
        line: lineNum,
        string: trimmed,
        suggestedKey: `${keyPrefix}.${keyPart}`,
        namespace,
        kind: 'jsx_text',
      });
    }
  });

  // message: '...' or message: "..." (common in setAlert)
  const messageRegex = /message:\s*["']([^"']+)["']/g;
  content.split(/\r?\n/).forEach((line, zeroIndex) => {
    let m;
    messageRegex.lastIndex = 0;
    while ((m = messageRegex.exec(line)) !== null) {
      const [, value] = m;
      if (shouldSkip(value)) continue;
      const keyPart = slug(value);
      results.push({
        file: path.relative(projectRoot, filePath),
        line: zeroIndex + 1,
        string: value,
        suggestedKey: `${keyPrefix}.msg_${keyPart}`,
        namespace,
        kind: 'message',
      });
    }
  });

  return results;
}

function walkDir(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full, list);
    else if (/\.(jsx|tsx)$/.test(e.name)) list.push(full);
  }
  return list;
}

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function getNested(obj, keyPath) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

function mergeReportIntoJson(report, langDir) {
  const byNamespace = {};
  report.forEach(({ namespace, suggestedKey, string }) => {
    if (!byNamespace[namespace]) byNamespace[namespace] = {};
    const keyInFile = suggestedKey.startsWith(namespace + '.')
      ? suggestedKey.slice(namespace.length + 1)
      : suggestedKey;
    const existing = getNested(byNamespace[namespace], keyInFile);
    if (existing === undefined) setNested(byNamespace[namespace], keyInFile, string);
  });

  const enDir = path.join(langDir, 'en');
  if (!fs.existsSync(enDir)) fs.mkdirSync(enDir, { recursive: true });

  for (const [ns, flatKeys] of Object.entries(byNamespace)) {
    const filePath = path.join(enDir, `${ns}.json`);
    let existing = {};
    if (fs.existsSync(filePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (_) {}
    }
    function mergeKeys(target, source, prefix = '') {
      for (const [k, v] of Object.entries(source)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          if (!target[k]) target[k] = {};
          mergeKeys(target[k], v, key);
        } else {
          const existingVal = getNested(existing, key);
          if (existingVal === undefined) setNested(existing, key, v);
        }
      }
    }
    mergeKeys(existing, flatKeys);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf8');
    console.log('Updated', filePath);
  }
}

// Flatten object to dot keys for setNested
function flattenObj(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flattenObj(v, key));
    else out[key] = v;
  }
  return out;
}

function main() {
  const files = walkDir(path.join(projectRoot, OPTS.dir));
  const all = [];
  files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    all.push(...extractFromFile(f, content));
  });

  const reportPath = path.join(__dirname, 'i18n-extract-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(all, null, 2), 'utf8');
  console.log('Report written:', reportPath, `(${all.length} strings)`);

  if (OPTS.updateJson && all.length > 0) {
    const langDir = path.join(projectRoot, 'lang');
    mergeReportIntoJson(all, langDir);
  }
}

main();
