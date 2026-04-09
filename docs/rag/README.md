# RAG Corpus for RAHJ AI

This folder contains LangChain-ready knowledge data generated from:
- user_guides (all .md and .txt files, recursive)
- erp (9).sql (database schema, table-wise)

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
- source_type: user_guide or database_schema
- source_path: source file path inside project
- document_title: document-level title
- section_title: section heading used for chunk context
- chunk_index: index inside that section
- tags: array of path/topic tags
- content: retrievable text body
- table_name: only for database_schema chunks

## Rebuild Command

Run from project root:

npm run rag:build

## Optional Custom Build

node scripts/build-rag-corpus.js --guides=user_guides --sql="erp (9).sql" --out=docs/rag --chunk-size=1200 --overlap=180

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
