# RAHJAI Data Flow Diagram

## 🔄 Complete Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  USER QUESTION (Urdu/English)                                   │
│  "RENT account ka balance kya hai?"                             │
│  "Stock levels show kro"                                        │
│  "New account add karna"                                        │
│                                                                  │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ AssistantOrchestratorService   │
        │  respond() method              │
        └────────┬───────────────────────┘
                 │
         ┌───────┴────────────┬────────────┬──────────┬──────┐
         │                    │            │          │      │
         ▼                    ▼            ▼          ▼      ▼
    ┌────────┐         ┌──────────┐  ┌────────┐ ┌──────┐ ┌-------┐
    │ Detect │         │ System   │  │ Smart  │ │Read- │ │Regular│
    │ Intent │         │ Context  │  │ Entry  │ │Only  │ │RAG    │
    │        │         │ Service  │  │ Flow   │ │Intent│ │Query  │
    └────────┘         └──────────┘  └────────┘ └──────┘ └-------┘
         │                   │           │         │        │
         └───────────────────┼───────────┴─────────┴────────┘
                             │
                  ┌──────────▼──────────┐
                  │ Is Form Entry?      │
                  │ (create account)    │
                  └──────────┬──────────┘
                             │
           ┌─────────────────┴────────────────┐
           │ YES                              │ NO
           ▼                                  ▼
    ┌────────────────┐            ┌──────────────────┐
    │Professional    │            │Real-Time Check   │
    │Form Service    │            │                  │
    │                │            │Is this a read-   │
    │1. Extract data │            │only query?       │
    │2. Validate     │            │(balance, stock)  │
    │3. Format       │            └──────────┬───────┘
    │4. Summarize    │                       │
    │5. Confirm      │         ┌─────────────┴────────────┐
    └────────┬───────┘         │ YES                      │ NO
             │                 ▼                          ▼
             │         ┌──────────────────┐     ┌─────────────────┐
             │         │RealtimeData      │     │EnhancedRAGSvc   │
             │         │Service           │     │                 │
             │         │                  │     │1. Detect intent │
             │         │1. Query DB       │     │2. Real-time     │
             │         │2. Filter company │     │   injection     │
             │         │3. Format amount  │     │3. Rank relevance│
             │         │4. Return PKR fmt │     │4. Merge results │
             │         └────────┬─────────┘     └────────┬────────┘
             │                  │                        │
             │                  └────────────┬───────────┘
             │                               │
             │                               ▼
             │                     ┌──────────────────┐
             │                     │RagCorpus Service │
             │                     │                  │
             │                     │1. Retrieve docs  │
             │                     │2. Tokenize       │
             │                     │3. Score match    │
             │                     │4. Return chunks  │
             │                     └────────┬─────────┘
             │                              │
             │                              ▼
             │                     ┌──────────────────┐
             │                     │GroqChatService   │
             │                     │                  │
             │                     │Send to Groq API  │
             │                     │+ context chunks  │
             │                     │→ Get answer      │
             │                     └────────┬─────────┘
             │                              │
             └──────────────────┬───────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │ Format Response      │
                    │                      │
                    │ - Add sources        │
                    │ - Language hint      │
                    │ - Metadata           │
                    │ - Suggestions        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Return to Frontend   │
                    │                      │
                    │ {                    │
                    │   answer: "PKR...",  │
                    │   sources: [...],    │
                    │   amount: 50000,     │
                    │   actions: [...]     │
                    │ }                    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Display to User      │
                    │                      │
                    │ ✅ Live data         │
                    │ ✅ Formatted amounts │
                    │ ✅ Action buttons    │
                    │ ✅ Urdu/English text │
                    └──────────────────────┘
```

---

## 🗄️ Database Integration

```
┌──────────────────────────────────────────────────┐
│                 Your Database                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  accounts (id, code, name, type, company_id)   │
│  ↓ Query: Account balances                      │
│  journal_voucher_lines (account_id, debit,      │
│    credit, date, voucher_id)                    │
│    ← RealtimeDataService queries here           │
│    → Returns: Balance = sum(debit) - sum(credit)│
│                                                  │
│  items (id, code, name, category)              │
│  ↓ Query: Stock levels                          │
│  inventory_balances (quantity, warehouse_id,   │
│    unit_price, value)                          │
│    ← RealtimeDataService queries here           │
│    → Returns: Qty + warehouse location          │
│                                                  │
│  purchase_orders (id, po_number, date, status, │
│    supplier_id, total_amount)                  │
│    ← RealtimeDataService queries here           │
│    → Returns: Pending POs with amounts          │
│                                                  │
│  goods_receipt_notes (id, grn_number, date...) │
│  locations (id, name)                           │
│  companies (id, name, currency)                 │
│                                                  │
└──────────────────────────────────────────────────┘
         ↑
         │ (Filtered by company_id, location_id)
         │
    RealtimeDataService
    $realtime->getAccountBalance()
    $realtime->getInventoryStock()
    $realtime->getPendingPurchaseOrders()
    etc.
```

---

## 🧠 Knowledge Base Flow

```
┌────────────────────────────────────────────────┐
│ KnowledgeBaseBuilder::buildCompleteKnowledgeBase │
│ (Run: php artisan rahjai:build-knowledge)      │
└──────────────────────┬─────────────────────────┘
                       │
        ┌──────────────┼──────────────┬─────────────┐
        │              │              │             │
        ▼              ▼              ▼             ▼
    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
    │Extract │    │Extract │    │Extract │    │Extract │
    │Database│    │Business│    │Module  │    │Valid-  │
    │Schema  │    │Rules & │    │Work    │    │ation   │
    │        │    │Config  │    │flows   │    │Rules   │
    │Tables, │    │        │    │        │    │        │
    │Columns │    │Unique  │    │Chart of│    │Code:   │
    │FK/Keys │    │Rules,  │    │Acc.    │    │Required│
    │      │    │Defaults │    │Steps   │    │Format  │
    └────┬───┘    └────┬───┘    └────┬───┘    └────┬───┘
         │             │             │             │
         │             │             │             │
         └──────────────┼─────────────┴─────────────┘
                        │
                        ▼
            ┌───────────────────────────┐
            │ Convert to JSONL Chunks   │
            │                           │
            │ {                         │
            │   source_type: "db",      │
            │   content: "...",         │
            │   tags: ["accounts"]      │
            │ }                         │
            └───────────────┬───────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │ Save to RAG Corpus        │
            │                           │
            │ docs/rag/langchain_      │
            │   chunks.jsonl            │
            │                           │
            │ (1000s of chunks)         │
            │ (All documented)          │
            │ (Always available)        │
            └───────────────┬───────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │ RagCorpus reads from here │
            │                           │
            │ When user asks:           │
            │ "How create account?"     │
            │ → Retrieves steps, rules  │
            │ → Returns to Groq API     │
            │ → Groq answers user       │
            └───────────────────────────┘
```

---

## 📊 Real-Time Data Injection

```
Query: "RENT account balance?"
                │
                ▼
    ┌───────────────────────────┐
    │ EnhancedRagService        │
    │ intelligentRetrieve()     │
    └───────────┬───────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │ Detect Intent:            │
    │ "account_balance"         │
    └───────────┬───────────────┘
                │
                ▼
    ┌──────────────────────────────────┐
    │ Inject Real-Time Data:           │
    │                                  │
    │ $realtime->getAccountBalance(    │
    │   'RENT',                        │
    │   '2026-04-10',                  │
    │   company_id                     │
    │ )                                │
    │                                  │
    │ Returns:                         │
    │ {                                │
    │   account_code: 'RENT',          │
    │   balance: 50000,                │
    │   debit: 50000,                  │
    │   credit: 0,                     │
    │   balance_formatted: 'PKR50,000' │
    │ }                                │
    └──────────┬───────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Merge with Static Docs:      │
    │                              │
    │ + Documentation about        │
    │   RENT account               │
    │ + How to create/modify       │
    │ + Related accounts           │
    │ + Validation rules           │
    └──────────┬────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Rank by Relevance (0-100):   │
    │                              │
    │ Real-time balance: 95        │
    │ Related accounts: 60         │
    │ How-to docs: 30              │
    │                              │
    │ → Send top 5 to Groq         │
    └──────────┬────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Groq Generates Answer:       │
    │                              │
    │ "RENT Account Balance        │
    │  As of April 10, 2026:       │
    │  PKR 50,000.00 (Debit)"      │
    │                              │
    │ [Includes amounts from       │
    │  real-time data]             │
    └──────────────────────────────┘

Result: ✅ Accurate + Current + Professional
```

---

## 📝 Form Entry Flow

```
User: "New account TELE, Telephone, Expense"
                │
                ▼
┌──────────────────────────────────────┐
│ SmartEntryService detects:           │
│ isCoaCodeCreationIntent() = true     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Extract from natural language:       │
│                                      │
│ code: "TELE"                         │
│ name: "Telephone"                    │
│ type: "Expense"                      │
│                                      │
│ → extractCoaCodeParams()             │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ ProfessionalFormService:             │
│ validateAndPrepareFormEntry()        │
│                                      │
│ Validate against rules:              │
│ - Code: regex, unique ✓              │
│ - Name: required, length ✓           │
│ - Type: enum ✓                       │
│ - Parent: defaults to input          │
└──────────┬───────────────────────────┘
           │
           ▼ Errors Found? NO
           │
           ▼
┌──────────────────────────────────────┐
│ Format Data:                         │
│                                      │
│ {                                    │
│   account_code: "TELE" (uppercase)   │
│   account_name: "Telephone"          │
│   account_type: "Expense"            │
│   is_transactional: true             │
│ }                                    │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Generate Summary (Urdu+English):     │
│                                      │
│ ✅ Chart of Accounts Entry           │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━         │
│ 📝 Code: TELE ✓                       │
│ 📋 Name: Telephone ✓                 │
│ 🔖 Type: Expense ✓                   │
│                                      │
│ Ready to save? [✓ Yes] [✗ No]       │
└──────────┬───────────────────────────┘
           │
           ▼ User confirms
           │
           ▼
┌──────────────────────────────────────┐
│ Save to Database                     │
│ Return success response              │
│                                      │
│ ✅ Account created successfully      │
│ 📝 Code: TELE                        │
│ 📍 In system now                     │
└──────────────────────────────────────┘
```

---

## 🔄 Loop: Keep Improving

```
Week 1: Build knowledge base
│
├─→ Run: php artisan rahjai:build-knowledge
│   Builds: Complete system documentation
│   Result: RAHJAI knows your system
│
Week 2: Test & Verify
│
├─→ Test each service in tinker
│   Check: Real-time queries work
│   Check: Forms validate correctly
│   Check: RAG retrieves proper docs
│
Week 3: Deploy & Monitor
│
├─→ Update controller
│   Integrate all services
│   Deploy to production
│   Monitor: Check error logs
│
Week 4+: Maintain
│
├─→ Weekly: php artisan rahjai:build-knowledge
│   This keeps docs up-to-date
│
├─→ Monthly: Review Groq API usage
│   Optimize prompts if needed
│
└─→ Ongoing: Add new modules/features
   Update rules in ProfessionalFormService
   Add new intent types in EnhancedRagService
```

---

## ✅ Verification Checklist

```
Knowledge Base
┌─ Is corpus file created? (docs/rag/langchain_chunks.jsonl)
├─ Size > 100KB? (many chunks)
└─ JSONL format valid? (each line is JSON)

Real-Time Data
┌─ DB connection working?
├─ Can query accounts table?
├─ Can query inventory_balances?
└─ Amounts formatted correctly? (PKR X,XXX.XX)

RAG Service
┌─ Intent detection working?
├─ Real-time data injected?
├─ Relevance ranking (0-100)?
└─ Returns top 5 best chunks?

Forms
┌─ Validation rules defined?
├─ Error messages in Urdu+English?
├─ Auto-formatting working? (uppercase, decimals)
└─ Confirmation summary shown?

Integration
┌─ All services in Orchestrator?
├─ Controller calls new service?
├─ Enhanced RAG used in respond()?
└─ User seeing real amounts?
```

---

**Complete System Ready! 🎉**
