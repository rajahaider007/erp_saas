/**
 * Add useTranslations import to any JSX file that uses useTranslations() but doesn't import it.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const pagesDir = path.join(projectRoot, 'resources', 'js', 'Pages');

function walk(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, list);
    else if (/\.(jsx|tsx)$/.test(e.name)) list.push(full);
  }
  return list;
}

const hookImport = "import { useTranslations } from '@/hooks/useTranslations';\n";
const files = walk(pagesDir);
let added = 0;
for (const fullPath of files) {
  let content = fs.readFileSync(fullPath, 'utf8');
  if (!/useTranslations\s*\(\)/.test(content)) continue;
  if (/from\s+['"]@?\.?\.?\/?hooks\/useTranslations['"]/.test(content)) continue;
  if (content.includes("from '@inertiajs/react'") || content.includes('from "@inertiajs/react"')) {
    content = content.replace(/(import\s+.*\s+from\s+['"]@?inertiajs\/react['"];?\n)/, '$1' + hookImport);
  } else if (content.includes("from 'react'") || content.includes('from "react"')) {
    content = content.replace(/(import\s+.*\s+from\s+['"]react['"];?\n)/, '$1' + hookImport);
  } else {
    content = hookImport + content;
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  added++;
  console.log(path.relative(projectRoot, fullPath));
}
console.log('Added import to', added, 'files.');
