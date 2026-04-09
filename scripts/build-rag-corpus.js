/**
 * Build LangChain-friendly RAG corpus from user guides and SQL schema.
 *
 * Usage:
 *   node scripts/build-rag-corpus.js
 *   node scripts/build-rag-corpus.js --guides=user_guides --sql="erp (9).sql" --out=docs/rag
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const OPTS = {
  guidesDir: readArg('guides', 'user_guides'),
  sqlFile: readArg('sql', 'erp (9).sql'),
  outDir: readArg('out', 'docs/rag'),
  chunkSize: Number(readArg('chunk-size', '1200')),
  overlap: Number(readArg('overlap', '180')),
};

const guidesDirAbs = path.join(projectRoot, OPTS.guidesDir);
const sqlFileAbs = path.join(projectRoot, OPTS.sqlFile);
const outDirAbs = path.join(projectRoot, OPTS.outDir);

function walkFiles(dir, allowedExts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, allowedExts, acc);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (allowedExts.has(ext)) acc.push(fullPath);
  }
  return acc;
}

function toPosixRelative(absPath) {
  const rel = path.relative(projectRoot, absPath).replace(/\\/g, '/');
  return rel || '.';
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function filenameToTitle(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitMarkdownSections(content, fallbackTitle) {
  const lines = content.split(/\n/);
  const sections = [];
  let currentTitle = fallbackTitle;
  let currentLines = [];
  let firstHeading = null;

  const flush = () => {
    const text = cleanText(currentLines.join('\n'));
    if (!text) return;
    sections.push({ sectionTitle: currentTitle, text });
    currentLines = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (!headingMatch) {
      currentLines.push(line);
      continue;
    }

    const headingText = headingMatch[2].trim();
    if (!firstHeading) firstHeading = headingText;
    flush();
    currentTitle = headingText || fallbackTitle;
  }

  flush();

  if (sections.length === 0) {
    const text = cleanText(content);
    if (text) sections.push({ sectionTitle: fallbackTitle, text });
  }

  return {
    docTitle: firstHeading || fallbackTitle,
    sections,
  };
}

function splitPlainSections(content, fallbackTitle) {
  const text = cleanText(content);
  if (!text) {
    return { docTitle: fallbackTitle, sections: [] };
  }
  return {
    docTitle: fallbackTitle,
    sections: [{ sectionTitle: fallbackTitle, text }],
  };
}

function chunkText(text, maxSize, overlap) {
  const normalized = cleanText(text);
  if (!normalized) return [];
  if (normalized.length <= maxSize) return [normalized];

  const chunks = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    let end = Math.min(cursor + maxSize, normalized.length);
    if (end < normalized.length) {
      const window = normalized.slice(cursor, end);
      const splitAt = Math.max(window.lastIndexOf('\n\n'), window.lastIndexOf('. '));
      if (splitAt > Math.floor(maxSize * 0.55)) {
        end = cursor + splitAt + 1;
      }
    }

    const chunk = normalized.slice(cursor, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= normalized.length) break;
    cursor = Math.max(end - overlap, cursor + 1);
  }

  return chunks;
}

function buildGuideRecords() {
  const files = walkFiles(guidesDirAbs, new Set(['.md', '.txt']));
  const records = [];
  let chunkCounter = 0;

  for (const absPath of files) {
    const relPath = toPosixRelative(absPath);
    const ext = path.extname(absPath).toLowerCase();
    const content = fs.readFileSync(absPath, 'utf8');
    const fallbackTitle = filenameToTitle(absPath);
    const parsed = ext === '.md'
      ? splitMarkdownSections(content, fallbackTitle)
      : splitPlainSections(content, fallbackTitle);

    const tags = relPath.split('/').slice(0, -1).filter(Boolean);

    for (const section of parsed.sections) {
      const pieces = chunkText(section.text, OPTS.chunkSize, OPTS.overlap);
      pieces.forEach((piece, idx) => {
        chunkCounter += 1;
        records.push({
          id: `guide-${String(chunkCounter).padStart(6, '0')}`,
          source_type: 'user_guide',
          source_path: relPath,
          document_title: parsed.docTitle,
          section_title: section.sectionTitle,
          chunk_index: idx,
          tags,
          content: piece,
        });
      });
    }
  }

  return records;
}

function parseCreateTables(sql) {
  const tables = [];
  const createRegex = /CREATE TABLE\s+`([^`]+)`\s*\(([^]*?)\)\s*ENGINE=/gi;
  let match;

  while ((match = createRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const lines = body
      .split(/\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line.replace(/,$/, ''));

    const columns = [];
    const keys = [];

    for (const line of lines) {
      if (line.startsWith('`')) {
        const colMatch = line.match(/^`([^`]+)`\s+([^\s]+(?:\([^)]*\))?)(.*)$/i);
        if (!colMatch) continue;
        const [, name, dataType, rest] = colMatch;
        const constraints = rest.trim();
        const nullable = !/NOT NULL/i.test(constraints);
        const defaultMatch = constraints.match(/DEFAULT\s+([^\s,]+)/i);

        columns.push({
          name,
          type: dataType,
          nullable,
          default: defaultMatch ? defaultMatch[1] : null,
          auto_increment: /AUTO_INCREMENT/i.test(constraints),
          constraints: constraints || null,
        });
        continue;
      }

      if (/^(PRIMARY KEY|UNIQUE KEY|KEY|CONSTRAINT)\b/i.test(line)) {
        keys.push(line);
      }
    }

    tables.push({
      table_name: tableName,
      columns,
      keys,
    });
  }

  return tables;
}

function tableToDocument(table) {
  const lines = [];
  lines.push(`Table: ${table.table_name}`);
  lines.push('');
  lines.push('Columns:');
  if (table.columns.length === 0) {
    lines.push('- No columns parsed.');
  } else {
    for (const col of table.columns) {
      const parts = [
        `${col.name} (${col.type})`,
        col.nullable ? 'NULLABLE' : 'NOT NULL',
      ];
      if (col.default) parts.push(`DEFAULT ${col.default}`);
      if (col.auto_increment) parts.push('AUTO_INCREMENT');
      lines.push(`- ${parts.join(' | ')}`);
    }
  }

  lines.push('');
  lines.push('Indexes and constraints:');
  if (table.keys.length === 0) {
    lines.push('- None declared in CREATE TABLE block.');
  } else {
    for (const keyLine of table.keys) {
      lines.push(`- ${keyLine}`);
    }
  }

  return lines.join('\n');
}

function buildDbRecords() {
  if (!fs.existsSync(sqlFileAbs)) return { records: [], tables: [] };

  const sql = fs.readFileSync(sqlFileAbs, 'utf8');
  const tables = parseCreateTables(sql);
  const records = [];
  let chunkCounter = 0;

  for (const table of tables) {
    const tableDoc = tableToDocument(table);
    const pieces = chunkText(tableDoc, OPTS.chunkSize, OPTS.overlap);

    pieces.forEach((piece, idx) => {
      chunkCounter += 1;
      records.push({
        id: `db-${String(chunkCounter).padStart(6, '0')}`,
        source_type: 'database_schema',
        source_path: toPosixRelative(sqlFileAbs),
        document_title: `Database table ${table.table_name}`,
        section_title: `Schema for ${table.table_name}`,
        chunk_index: idx,
        tags: ['database', 'schema', table.table_name],
        table_name: table.table_name,
        content: piece,
      });
    });
  }

  return { records, tables };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function writeJsonl(filePath, records) {
  const body = records.map(r => JSON.stringify(r)).join('\n');
  fs.writeFileSync(filePath, body + (body ? '\n' : ''), 'utf8');
}

function main() {
  ensureDir(outDirAbs);

  const guideRecords = buildGuideRecords();
  const db = buildDbRecords();
  const allRecords = [...guideRecords, ...db.records];

  const generatedAt = new Date().toISOString();
  const manifest = {
    generated_at: generatedAt,
    project_root: toPosixRelative(projectRoot),
    input: {
      guides_dir: OPTS.guidesDir,
      sql_file: OPTS.sqlFile,
    },
    counts: {
      total_chunks: allRecords.length,
      user_guide_chunks: guideRecords.length,
      database_chunks: db.records.length,
      parsed_tables: db.tables.length,
    },
    files: {
      chunks_jsonl: `${OPTS.outDir}/langchain_chunks.jsonl`,
      schema_json: `${OPTS.outDir}/schema_tables.json`,
      manifest_json: `${OPTS.outDir}/manifest.json`,
    },
  };

  writeJsonl(path.join(outDirAbs, 'langchain_chunks.jsonl'), allRecords);
  writeJson(path.join(outDirAbs, 'schema_tables.json'), {
    generated_at: generatedAt,
    source_sql_file: OPTS.sqlFile,
    table_count: db.tables.length,
    tables: db.tables,
  });
  writeJson(path.join(outDirAbs, 'manifest.json'), manifest);

  console.log('RAG corpus generated.');
  console.log(`Chunks: ${allRecords.length}`);
  console.log(`Guide chunks: ${guideRecords.length}`);
  console.log(`Database chunks: ${db.records.length}`);
  console.log(`Tables parsed: ${db.tables.length}`);
  console.log(`Output dir: ${toPosixRelative(outDirAbs)}`);
}

main();
