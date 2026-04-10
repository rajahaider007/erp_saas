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
  /** Max characters per route-catalog chunk (large = fewer records, more context per chunk). */
  routeCatalogChunkSize: Number(readArg('route-catalog-chunk-size', '4500')),
};

const guidesDirAbs = path.join(projectRoot, OPTS.guidesDir);
const docsDirAbs = path.join(projectRoot, 'docs');
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

/**
 * High-priority chunks with canonical in-app URLs. Prepended so lexical RAG ranks them
 * above unrelated controller code (e.g. GRN supplier invoice) for "supplier/customer" questions.
 */
function buildNavigationAnchorRecords() {
  const content = [
    'Authoritative navigation for this ERP (use these paths in markdown links when advising users).',
    '',
    '**Supplier / vendor (create or list payables party):**',
    '- List: [Vendor master](/inventory/master-data/vendor-master)',
    '- Create new supplier: [Create vendor](/inventory/master-data/vendor-master/create)',
    '',
    '**Customer (create or list receivables party):**',
    '- List: [Customer master](/inventory/master-data/customer-master)',
    '- Create new customer: [Create customer](/inventory/master-data/customer-master/create)',
    '',
    '**Chart of accounts (COA tree, Level 4 codes, not the same as opening party forms):**',
    '- [Chart of accounts](/accounts/chart-of-accounts)',
    '',
    'Party masters (vendor/customer) create a linked Level 4 account under Accounts Payable / Accounts Receivable configuration. They are maintained from **Inventory → Master data**, not from GRN supplier invoice.',
    '',
    '**Do not** tell users to use [GRN supplier invoice](/inventory/grn-supplier-invoice) or [Create GRN supplier invoice](/inventory/grn-supplier-invoice/create) to *register* a new supplier — that module posts invoices against vendors that already exist.',
    '',
    '**Related procurement (after vendor exists):**',
    '- [Purchase requisition](/inventory/purchase-requisition)',
    '- [Purchase order](/inventory/purchase-order)',
    '- [Goods receipt (GRN)](/inventory/goods-receipt-note)',
    '- [GRN supplier invoice](/inventory/grn-supplier-invoice) — for invoicing received goods, not for creating vendor master.',
    '',
    'Keywords: supplier, vendors, vendor master, customer master, add supplier, add customer, new vendor, new customer, party, AP, AR, master data.',
  ].join('\n');

  return [
    {
      id: 'nav-000001',
      source_type: 'user_guide',
      source_path: 'system::navigation_anchors',
      document_title: 'ERP screen URLs — suppliers, customers, vendors (authoritative)',
      section_title: 'Where to add a supplier or customer',
      chunk_index: 0,
      tags: ['navigation', 'supplier', 'customer', 'vendor', 'master_data', 'how_to', 'routes', 'rahj_ai'],
      content,
    },
  ];
}

function loadLaravelRoutesJson() {
  const result = spawnSync(
    phpBinary,
    ['artisan', 'route:list', '--json', '--except-vendor', '--no-ansi'],
    {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    },
  );

  if (result.error) {
    console.warn('route:list spawn error:', result.error.message);
    return [];
  }
  if (result.status !== 0) {
    console.warn('route:list failed:', (result.stderr || result.stdout || '').trim());
    return [];
  }
  try {
    const data = JSON.parse(String(result.stdout || '[]').trim());
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('route:list JSON parse error:', e.message);
    return [];
  }
}

function normalizeRouteUri(uri) {
  const u = String(uri || '').trim().split('?')[0];
  if (!u || u === '/') return '/';
  return u.startsWith('/') ? u : `/${u}`;
}

function routeUsesWebMiddleware(route) {
  const raw = route.middleware;
  const s = raw == null ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw);
  return s.toLowerCase().includes('web');
}

function shouldSkipRouteForCatalog(uri) {
  if (uri === '/up') return true;
  if (uri.startsWith('/_')) return true;
  if (uri.startsWith('/api/')) return true;
  if (uri.startsWith('/sanctum/')) return true;
  return false;
}

function shortenAction(action) {
  if (action == null) return '';
  const a = String(action);
  const m = a.match(/([A-Za-z0-9_]+Controller)@[a-z_]+/i);
  if (m) return m[1];
  if (a.length > 90) return `${a.slice(0, 87)}...`;
  return a;
}

/**
 * Full GET route listing from the running Laravel app (accurate URLs for "where is X screen?").
 */
function buildRouteCatalogRecords() {
  const routes = loadLaravelRoutesJson();
  const rows = [];

  for (const r of routes) {
    const method = String(r.method || '');
    if (!/\bGET\b/.test(method)) continue;
    const uri = normalizeRouteUri(r.uri);
    if (shouldSkipRouteForCatalog(uri)) continue;
    if (!routeUsesWebMiddleware(r)) continue;
    rows.push(r);
  }

  rows.sort((a, b) => String(a.uri).localeCompare(String(b.uri)));

  const lines = rows.map((r) => {
    const uri = normalizeRouteUri(r.uri);
    const name = r.name ? String(r.name) : '';
    const action = shortenAction(r.action);
    const label = name || uri;
    const namePart = name ? ` — route name: \`${name}\`` : '';
    const actPart = action ? ` — ${action}` : '';
    return `- [${label}](${uri})${namePart}${actPart}`;
  });

  const body = [
    'Official application page index (live `php artisan route:list`, GET + web middleware only).',
    'Use these paths for markdown links like [Title](/path). Dynamic segments like `{id}` are shown as in Laravel.',
    '',
    ...lines,
  ].join('\n');

  const pieces = chunkText(body, OPTS.routeCatalogChunkSize, 280);
  const preamble = '**Route catalog (system):** answers like “where is screen X” should prefer these URIs.\n\n';

  return pieces.map((content, idx) => ({
    id: `routes-${String(idx + 1).padStart(5, '0')}`,
    source_type: 'user_guide',
    source_path: 'system::route_catalog',
    document_title: 'All ERP pages (GET routes)',
    section_title: `Route catalog ${idx + 1} / ${pieces.length}`,
    chunk_index: idx,
    tags: ['routes', 'navigation', 'pages', 'urls', 'laravel', 'rahj_ai', 'system'],
    content: idx === 0 ? preamble + content : content,
  }));
}

function buildMarkdownDirRecords(dirAbs, idPrefix, walkOptions = {}) {
  if (!fs.existsSync(dirAbs)) return [];

  const files = walkFiles(dirAbs, new Set(['.md', '.txt']), [], walkOptions);
  const records = [];
  let chunkCounter = 0;

  for (const absPath of files) {
    const relPath = toPosixRelative(absPath);
    const ext = path.extname(absPath).toLowerCase();
    const fileContent = fs.readFileSync(absPath, 'utf8');
    const fallbackTitle = filenameToTitle(absPath);
    const parsed = ext === '.md'
      ? splitMarkdownSections(fileContent, fallbackTitle)
      : splitPlainSections(fileContent, fallbackTitle);

    const tags = relPath.split('/').slice(0, -1).filter(Boolean);

    for (const section of parsed.sections) {
      const pieces = chunkText(section.text, OPTS.chunkSize, OPTS.overlap);
      pieces.forEach((piece, idx) => {
        chunkCounter += 1;
        records.push({
          id: `${idPrefix}-${String(chunkCounter).padStart(6, '0')}`,
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

function buildGuideRecords() {
  return buildMarkdownDirRecords(guidesDirAbs, 'guide');
}

/** Project docs/ markdown (excludes docs/rag build output). */
function buildDocsMarkdownRecords() {
  return buildMarkdownDirRecords(docsDirAbs, 'dguide', {
    shouldSkipDir: (fullPath) => {
      const rel = toPosixRelative(fullPath);
      return rel === 'docs/rag' || rel.startsWith('docs/rag/');
    },
  });
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

  const navigationAnchors = buildNavigationAnchorRecords();
  const routeCatalog = buildRouteCatalogRecords();
  const guideRecords = buildGuideRecords();
  const docsGuideRecords = buildDocsMarkdownRecords();
  const code = buildCodeRecords();
  const db = buildDbRecords();
  const allRecords = [
    ...navigationAnchors,
    ...routeCatalog,
    ...guideRecords,
    ...docsGuideRecords,
    ...code.records,
    ...db.records,
  ];

  const generatedAt = new Date().toISOString();
  const manifest = {
    generated_at: generatedAt,
    project_root: toPosixRelative(projectRoot),
    input: {
      guides_dir: OPTS.guidesDir,
      docs_dir: 'docs (excluding docs/rag)',
      sql_file: OPTS.sqlFile,
      code_dirs: OPTS.codeDirs,
      include_sensitive: OPTS.includeSensitive,
      route_catalog_chunk_size: OPTS.routeCatalogChunkSize,
    },
    counts: {
      total_chunks: allRecords.length,
      navigation_anchor_chunks: navigationAnchors.length,
      route_catalog_chunks: routeCatalog.length,
      user_guide_chunks: guideRecords.length,
      docs_markdown_chunks: docsGuideRecords.length,
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
  console.log(`Route catalog chunks: ${routeCatalog.length}`);
  console.log(`Guide chunks: ${guideRecords.length}`);
  console.log(`Docs markdown chunks: ${docsGuideRecords.length}`);
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
