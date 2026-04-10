/**
 * Build LangChain-friendly RAG corpus from user guides and live database schema.
 *
 * Usage:
 *   node scripts/build-rag-corpus.js
 *   node scripts/build-rag-corpus.js --guides=user_guides --sql="erp (9).sql" --out=docs/rag
 */

import fs from 'fs';
import { spawnSync } from 'child_process';
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
  codeDirs: readArg('code-dirs', 'app,config,resources,routes,lang,scripts')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  codeOverlapLines: Number(readArg('code-overlap-lines', '8')),
  includeSensitive: readArg('include-sensitive', 'false') === 'true',
};

const guidesDirAbs = path.join(projectRoot, OPTS.guidesDir);
const sqlFileAbs = path.join(projectRoot, OPTS.sqlFile);
const liveSchemaScriptAbs = path.join(projectRoot, 'scripts', 'export-rag-schema.php');
const outDirAbs = path.join(projectRoot, OPTS.outDir);
const phpBinary = process.env.PHP_BINARY || 'php';

const SENSITIVE_FILE_NAME_PATTERNS = [
  /^\.env(?:\..+)?$/i,
  /^id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?$/i,
  /^authorized_keys$/i,
  /^known_hosts$/i,
  /\.(?:pem|key|p12|pfx|jks|keystore|der|crt|cer|kdbx)$/i,
];

const SENSITIVE_PATH_PATTERNS = [
  /(?:^|\/)secrets?(?:\/|$)/i,
  /(?:^|\/)(?:certs?|certificates)(?:\/|$)/i,
  /(?:^|\/)private(?:\/|$)/i,
];

const SENSITIVE_CONTENT_PATTERNS = [
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bglpat-[A-Za-z0-9\-_]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bASIA[0-9A-Z]{16}\b/,
];

function walkFiles(dir, allowedExts, acc = [], options = {}) {
  const {
    shouldSkipDir = () => false,
    shouldSkipFile = () => false,
  } = options;

  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(fullPath, entry.name)) continue;
      walkFiles(fullPath, allowedExts, acc, options);
      continue;
    }

    if (shouldSkipFile(fullPath, entry.name)) continue;

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

function inferCodeLanguage(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.blade.php')) return 'blade';

  const ext = path.extname(lower);
  switch (ext) {
    case '.php':
      return 'php';
    case '.js':
      return 'javascript';
    case '.jsx':
      return 'jsx';
    case '.ts':
      return 'typescript';
    case '.tsx':
      return 'tsx';
    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    case '.txt':
      return 'text';
    case '.css':
      return 'css';
    case '.scss':
      return 'scss';
    case '.yml':
    case '.yaml':
      return 'yaml';
    default:
      return ext.replace(/^\./, '') || 'text';
  }
}

function chunkCodeWithLineNumbers(content, maxSize, overlapLines) {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const chunks = [];
  let start = 0;

  while (start < lines.length) {
    let size = 0;
    let end = start;

    while (end < lines.length) {
      const lineLength = lines[end].length + 1;
      if (size + lineLength > maxSize && end > start) break;
      size += lineLength;
      end += 1;
    }

    const piece = lines.slice(start, end).join('\n').trimEnd();
    if (piece) {
      chunks.push({
        text: piece,
        startLine: start + 1,
        endLine: end,
      });
    }

    if (end >= lines.length) break;
    start = Math.max(end - overlapLines, start + 1);
  }

  return chunks;
}

function isSensitiveFilePath(relPath) {
  const normalized = relPath.replace(/\\/g, '/').toLowerCase();
  const base = path.basename(normalized);

  if (SENSITIVE_FILE_NAME_PATTERNS.some(rx => rx.test(base))) return true;
  if (SENSITIVE_PATH_PATTERNS.some(rx => rx.test(normalized))) return true;

  return false;
}

function hasSensitiveContent(content) {
  return SENSITIVE_CONTENT_PATTERNS.some(rx => rx.test(content));
}

function buildCodeRecords() {
  const allowedExts = new Set([
    '.php',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.json',
    '.md',
    '.txt',
    '.css',
    '.scss',
    '.yml',
    '.yaml',
  ]);

  const records = [];
  let chunkCounter = 0;
  let fileCounter = 0;
  let sensitiveExcludedCount = 0;
  const sensitiveExcludedSamples = [];

  for (const dir of OPTS.codeDirs) {
    const absDir = path.join(projectRoot, dir);
    const files = walkFiles(absDir, allowedExts);

    for (const absPath of files) {
      const relPath = toPosixRelative(absPath);
      const content = fs.readFileSync(absPath, 'utf8');

      if (!OPTS.includeSensitive) {
        const shouldExclude = isSensitiveFilePath(relPath) || hasSensitiveContent(content);
        if (shouldExclude) {
          sensitiveExcludedCount += 1;
          if (sensitiveExcludedSamples.length < 25) sensitiveExcludedSamples.push(relPath);
          continue;
        }
      }

      fileCounter += 1;
      const chunks = chunkCodeWithLineNumbers(content, OPTS.chunkSize, OPTS.codeOverlapLines);
      const language = inferCodeLanguage(absPath);

      chunks.forEach((chunk, idx) => {
        chunkCounter += 1;
        records.push({
          id: `code-${String(chunkCounter).padStart(6, '0')}`,
          source_type: 'application_source',
          source_path: relPath,
          document_title: relPath,
          section_title: `Code chunk ${idx + 1}`,
          chunk_index: idx,
          line_start: chunk.startLine,
          line_end: chunk.endLine,
          language,
          tags: ['codebase', dir, language],
          content: chunk.text,
        });
      });
    }
  }

  return {
    records,
    filesIndexed: fileCounter,
    sensitiveExcludedCount,
    sensitiveExcludedSamples,
  };
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

function buildDbRecordsFromTables(tables, sourcePath) {
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
        source_path: sourcePath,
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

function buildDbRecordsFromSql(sql, sourcePath) {
  const tables = parseCreateTables(sql);
  return buildDbRecordsFromTables(tables, sourcePath);
}

function loadLiveDatabaseSchema() {
  if (!fs.existsSync(liveSchemaScriptAbs)) {
    throw new Error(`Live schema exporter not found: ${toPosixRelative(liveSchemaScriptAbs)}`);
  }

  const result = spawnSync(phpBinary, [liveSchemaScriptAbs], {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    env: process.env,
  });

  if (result.status !== 0) {
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    const message = stderr || stdout || `PHP exited with code ${result.status ?? 'unknown'}`;
    throw new Error(message);
  }

  const sql = String(result.stdout || '').trim();
  if (!sql) {
    throw new Error('Live schema exporter returned no schema output.');
  }

  return sql;
}

function buildDbRecords() {
  try {
    const liveSql = loadLiveDatabaseSchema();
    return {
      ...buildDbRecordsFromSql(liveSql, 'database/live-schema.sql'),
      source: 'live',
      sourceLabel: 'live database',
    };
  } catch (error) {
    if (fs.existsSync(sqlFileAbs)) {
      console.warn(`Live schema export failed, falling back to SQL dump: ${error.message}`);
      const sql = fs.readFileSync(sqlFileAbs, 'utf8');
      return {
        ...buildDbRecordsFromSql(sql, toPosixRelative(sqlFileAbs)),
        source: 'sql',
        sourceLabel: toPosixRelative(sqlFileAbs),
      };
    }

    throw error;
  }
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
  const code = buildCodeRecords();
  const db = buildDbRecords();
  const allRecords = [...guideRecords, ...code.records, ...db.records];

  const generatedAt = new Date().toISOString();
  const manifest = {
    generated_at: generatedAt,
    project_root: toPosixRelative(projectRoot),
    input: {
      guides_dir: OPTS.guidesDir,
      sql_file: OPTS.sqlFile,
      code_dirs: OPTS.codeDirs,
      include_sensitive: OPTS.includeSensitive,
    },
    counts: {
      total_chunks: allRecords.length,
      user_guide_chunks: guideRecords.length,
      application_source_chunks: code.records.length,
      database_chunks: db.records.length,
      application_source_files: code.filesIndexed,
      sensitive_excluded_files: code.sensitiveExcludedCount,
      parsed_tables: db.tables.length,
    },
    source: {
      database: db.source,
      database_label: db.sourceLabel,
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
    source_database: db.source,
    source_sql_file: db.source === 'sql' ? OPTS.sqlFile : null,
    table_count: db.tables.length,
    tables: db.tables,
  });
  writeJson(path.join(outDirAbs, 'manifest.json'), manifest);

  console.log('RAG corpus generated.');
  console.log(`Chunks: ${allRecords.length}`);
  console.log(`Guide chunks: ${guideRecords.length}`);
  console.log(`Application source chunks: ${code.records.length}`);
  console.log(`Application source files: ${code.filesIndexed}`);
  console.log(`Sensitive files excluded: ${code.sensitiveExcludedCount}`);
  console.log(`Database chunks: ${db.records.length}`);
  console.log(`Tables parsed: ${db.tables.length}`);
  console.log(`Output dir: ${toPosixRelative(outDirAbs)}`);

  if (code.sensitiveExcludedSamples.length > 0) {
    console.log('Sensitive exclusion samples:');
    code.sensitiveExcludedSamples.forEach(file => console.log(`- ${file}`));
  }
}

main();
