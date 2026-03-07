/**
 * Apply translation t() to JSX files using i18n-extract-report.json.
 * - Adds useTranslations import and const { t } in the main component.
 * - Replaces hardcoded strings with t('key') by line (attr, jsx_text, message).
 *
 * Usage: node scripts/i18n-apply.js [--dry-run] [--file=path/to/one.jsx]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const reportPath = path.join(__dirname, 'i18n-extract-report.json');
const dryRun = process.argv.includes('--dry-run');
const singleFile = process.argv.find(a => a.startsWith('--file='))?.slice(7)?.replace(/\\/g, '/');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findComponentStarts(lines) {
  const starts = [];
  lines.forEach((line, i) => {
    if (/^\s*const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{?\s*$/.test(line) || /^\s*function\s+\w+\s*\([^)]*\)\s*\{?\s*$/.test(line)) {
      starts.push(i + 1);
    }
  });
  return starts;
}

function componentForLine(lineNum, componentStarts) {
  const below = componentStarts.filter(s => s <= lineNum);
  return below.length ? below[below.length - 1] : null;
}

function addUseTranslations(content, pathFromRoot, replacementLines) {
  let insertedAfter = [];
  const hasHookImport = /from\s+['"]@?\.?\.?\/?hooks\/useTranslations['"]/.test(content);
  if (!hasHookImport) {
    const hookImport = "import { useTranslations } from '@/hooks/useTranslations';\n";
    if (content.includes("from '@inertiajs/react'") || content.includes('from "@inertiajs/react"')) {
      content = content.replace(/(import\s+.*\s+from\s+['"]@?inertiajs\/react['"];?\n)/, '$1' + hookImport);
    } else if (content.includes("from 'react'") || content.includes('from "react"')) {
      content = content.replace(/(import\s+.*\s+from\s+['"]react['"];?\n)/, '$1' + hookImport);
    } else {
      content = hookImport + content;
    }
  }

  const lines = content.split(/\r?\n/);
  const componentStarts = findComponentStarts(lines);
  const componentsNeedingT = new Set();
  replacementLines.forEach(lineNum => {
    const start = componentForLine(lineNum, componentStarts);
    if (start != null) componentsNeedingT.add(start);
  });

  const sortedStarts = [...componentsNeedingT].sort((a, b) => b - a);
  sortedStarts.forEach(oneBased => {
    const idx = oneBased - 1;
    if (idx < 0 || idx >= lines.length) return;
    const line = lines[idx];
    if (/const\s+\{\s*t\s*\}\s*=\s*useTranslations\s*\(\)/.test(lines[idx + 1] || '')) return;
    const indent = (line.match(/^(\s*)/) || ['', ''])[1];
    const insert = indent + 'const { t } = useTranslations();';
    lines.splice(idx + 1, 0, insert);
    insertedAfter.push(oneBased);
  });

  return { content: lines.join('\n'), insertedAfter };
}

function shiftEntries(entries, insertedAfter) {
  return entries.map(e => {
    const shift = insertedAfter.filter(ln => ln < e.line).length;
    return { ...e, line: e.line + shift };
  });
}

function applyReplacements(content, entries) {
  const lines = content.split(/\r?\n/);
  const byLine = {};
  entries.forEach(e => {
    if (!byLine[e.line]) byLine[e.line] = [];
    byLine[e.line].push(e);
  });

  Object.keys(byLine).sort((a, b) => Number(b) - Number(a)).forEach(lineNum => {
    const idx = Number(lineNum) - 1;
    if (idx < 0 || idx >= lines.length) return;
    let line = lines[idx];
    byLine[lineNum].forEach(({ string: str, suggestedKey: key, kind }) => {
      const esc = escapeRegex(str);
      try {
        if (kind === 'attr') {
          const re = new RegExp(`(placeholder|title|aria-label)=(["'])${esc}\\2`);
          if (re.test(line)) {
            line = line.replace(re, `$1={t('${key.replace(/'/g, "\\'")}')}`);
          }
        } else if (kind === 'jsx_text') {
          const re = new RegExp(`>\\s*${esc}\\s*<`);
          if (re.test(line)) {
            line = line.replace(re, `>{t('${key.replace(/'/g, "\\'")}')}<`);
          }
        } else if (kind === 'message') {
          const re = new RegExp(`message:\\s*["']${esc}["']`);
          if (re.test(line)) {
            line = line.replace(re, `message: t('${key.replace(/'/g, "\\'")}')`);
          }
        }
      } catch (_) {}
    });
    lines[idx] = line;
  });

  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(reportPath)) {
    console.error('Run npm run i18n:extract first.');
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const byFile = {};
  report.forEach(entry => {
    const f = entry.file.replace(/\\/g, '/');
    if (singleFile && !f.includes(singleFile)) return;
    if (!byFile[f]) byFile[f] = [];
    byFile[f].push(entry);
  });

  let total = 0;
  for (const relPath of Object.keys(byFile)) {
    const fullPath = path.join(projectRoot, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn('Skip (not found):', relPath);
      continue;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    const entries = byFile[relPath];
    const replacementLines = entries.map(e => e.line);
    const { content: content2, insertedAfter } = addUseTranslations(content, relPath, replacementLines);
    content = content2;
    const shiftedEntries = shiftEntries(entries, insertedAfter);
    content = applyReplacements(content, shiftedEntries);
    if (!dryRun) fs.writeFileSync(fullPath, content, 'utf8');
    total++;
    console.log(dryRun ? '[dry-run] ' : '', relPath);
  }
  console.log('Done.', total, 'files.');
}

main();
