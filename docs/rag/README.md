# RAG Corpus for RAHJ AI

This folder contains LangChain-ready knowledge data generated from:
- user_guides (all .md and .txt files, recursive)
- application source folders (recursive): app, config, resources, routes, lang, scripts
- live database schema exported automatically from the app connection
- erp (9).sql (fallback only when live export is unavailable)

Sensitive-source safety defaults:
- env-like and secret key/certificate files are auto-excluded from application_source indexing
- files with high-confidence secret token/private-key content patterns are auto-excluded
- this behavior is enabled by default

## Generated Files

- manifest.json
  - Corpus summary, counts, source inputs, and output file pointers.

- langchain_chunks.jsonl
  - Main ingestion file for RAG.
  - One JSON object per line (JSONL format).
  - Each line is a chunk with metadata + content.

- schema_tables.json
  - Structured database schema extraction.
  - Table and column details with parsed constraints/indexes.

## Chunk Record Format

Each line in langchain_chunks.jsonl includes fields similar to:

- id: unique chunk id
- source_type: user_guide, application_source, or database_schema
- source_path: source file path inside project
- document_title: document-level title
- section_title: section heading used for chunk context
- chunk_index: index inside that section
- tags: array of path/topic tags
- content: retrievable text body
- language: only for application_source chunks
- line_start and line_end: only for application_source chunks
- table_name: only for database_schema chunks

## Rebuild Command

Run from project root:

npm run rag:build

## Optional Custom Build

node scripts/build-rag-corpus.js --guides=user_guides --sql="erp (9).sql" --out=docs/rag --chunk-size=1200 --overlap=180

Custom source folders can be passed with:

node scripts/build-rag-corpus.js --code-dirs=app,config,resources,routes,lang,scripts

To force include sensitive files (not recommended):

node scripts/build-rag-corpus.js --include-sensitive=true

The default build prefers the live database schema, so you do not need to download or refresh a SQL dump manually.

## LangChain Ingestion Notes

Recommended setup:

1) Load JSONL records from docs/rag/langchain_chunks.jsonl
2) Use content as page_content
3) Keep all other fields in metadata
4) Embed and upsert into your vector DB
5) Add metadata filters by source_type, source_path, table_name, or tags

Suggested retrieval strategy:

- Top-k semantic retrieval on content
- Metadata filter by source_type when user asks DB-only or guide-only questions
- Re-rank final passages for answer grounding

## Why this format works for RAG

- Small, consistent chunks
- Strong metadata for filtering and attribution
- JSONL streaming-friendly for loaders and batch jobs
- Separate schema_tables.json for deterministic DB lookups
- Live database export keeps the schema snapshot aligned with the current app state
