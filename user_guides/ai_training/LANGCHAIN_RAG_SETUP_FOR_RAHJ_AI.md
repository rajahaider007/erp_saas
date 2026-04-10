# LangChain RAG Setup for RAHJ AI

## Objective

Convert ERP user guides and SQL schema into a retrieval-friendly corpus, then use it in RAHJ AI.

Data sources covered:
- user_guides (all markdown and text files)
- live database schema exported automatically from the app connection
- erp (9).sql (fallback only when live export is unavailable)

## Current Output Location

Generated corpus files:
- docs/rag/langchain_chunks.jsonl
- docs/rag/schema_tables.json
- docs/rag/manifest.json
- docs/rag/README.md

## How to Regenerate

From project root run:

npm run rag:build

This command runs:

node scripts/build-rag-corpus.js

The build now exports schema from the running database automatically before generating the corpus.

## Chunk Design (RAG Friendly)

Each JSONL row includes:
- id
- source_type (user_guide or database_schema)
- source_path
- document_title
- section_title
- chunk_index
- tags
- content
- table_name (only for database schema chunks)

This structure supports:
- semantic search on content
- metadata filters by source_type, source_path, table_name, tags
- source attribution in final answers

## Suggested LangChain Ingestion Flow

1) Load docs/rag/langchain_chunks.jsonl as JSONL records.
2) Map content to Document.page_content.
3) Map remaining fields to Document.metadata.
4) Create embeddings and store in vector DB.
5) Query with top-k retrieval and metadata filtering.
6) Re-rank before final answer generation.

## Suggested Metadata Filters

- source_type = database_schema for SQL/table questions
- source_type = user_guide for process/how-to questions
- table_name = chart_of_accounts (example) for table-specific prompts
- tags includes inventory_system or accounts_module for module-specific prompts

## RAHJ AI Integration Status

Current routes (implemented):
- POST /rahj-ai/chat
- GET /rahj-ai/history

Controller:
- app/Http/Controllers/RahjAiController.php

Orchestration service:
- app/Services/RahjAi/AssistantOrchestratorService.php

Core behavior:
1) Phase A: RAG guidance remains active as default fallback.
2) Phase B: Read-only intelligence tools run before RAG when query intent matches stock/receivables/reporting.
3) Phase C: Assisted-entry draft prefill suggestions are returned (no direct DB writes).
4) Phase D: Clarification prompts, Urdu/English mixed response adaptation, and frequent metric caching are active.

## Phase B: Read-only Intelligence (Permission-aware)

Implemented tools:
- Inventory/stock flow snapshot
- Receivables snapshot with aging buckets
- Simple period report metrics

Permission behavior:
- Menu-level can_view checks are enforced against user rights.
- Company/location scope is resolved from session/request/auth user.
- If scope is missing, assistant asks clarification instead of running unscoped queries.

Data scope behavior:
- Tools only read data for current company + location context.
- Date range is optional for inventory and receivables; required for explicit period-report style requests.

## Phase C: Assisted Entry (Draft + Review)

Implemented assisted targets:
- Purchase Requisition draft prefill
- Purchase Order draft prefill
- Goods Receipt Note draft prefill

Safety rule:
- Assistant does not save records.
- Assistant returns route + payload suggestion only.
- User still saves via normal form flow, so existing validation rules are preserved.

Response includes action metadata:
- action.type = draft_prefill
- action.target = purchase_requisition | purchase_order | goods_receipt_note
- action.route = create form route
- action.payload = suggested form values
- action.requires_review = true

## Phase D: Polish Features

Implemented:
- Multi-turn clarification:
	- If report query lacks date range, assistant asks follow-up and stores pending clarification context.
	- Next user message can complete the missing date range and continue.
- Urdu/English mix adaptation:
	- Urdu-script input triggers mixed-language friendly response style.
- Frequent metrics caching:
	- Read-only metric queries are cached by scope + intent + date-range fingerprint.

## Chat Response Contract (Current)

Server response fields:
- success
- conversation_id
- answer
- model
- sources
- meta (mode, intent, scope, date range, language hint)
- action (optional; populated for assisted-entry draft responses)

Client context:
- resources/js/Contexts/RahjAiAssistantContext.jsx now stores meta and action on assistant messages.

## Operational Recommendation

Rebuild corpus whenever:
- user guides are updated
- SQL schema changes
- major accounting/reporting logic changes

Use docs/rag/manifest.json to verify refresh timestamp, chunk counts, and whether the database source was live or fallback SQL.
