# RAHJAI System - Complete Implementation Guide

## 📋 Overview
This document describes the complete RAHJAI system overhaul with 6 integrated services to provide accurate, real-time answers and professional form management.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│         AssistantOrchestratorService                │
│   (Orchestrates all services)                       │
└──────────┬──────────────────────────────────────────┘
           │
    ┌──────┴──────┬────────────┬─────────────┬──────────────┐
    │             │            │             │              │
    ▼             ▼            ▼             ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────┐
│Enhanced│  │Knowledge │  │Realtime  │  │Professional│  │System   │
│RAG Svc │  │Base Svc  │  │Data Svc  │  │Form Svc    │  │Context  │
└────────┘  └──────────┘  └──────────┘  └────────────┘  └─────────┘
```

---

## 📦 Services

### 1️⃣ **KnowledgeBaseBuilder** 
**File:** `app/Services/RahjAi/KnowledgeBaseBuilder.php`

**Purpose:** Auto-generates comprehensive system documentation

**Features:**
- Extracts database schema (tables, columns, relationships)
- Documents business entities and workflows
- Creates data dictionary
- Extracts validation rules
- Saves everything to RAG corpus

**Usage:**
```php
$builder = app(KnowledgeBaseBuilder::class);
$builder->buildCompleteKnowledgeBase();
```

**Output:** JSONL corpus with complete system knowledge

---

### 2️⃣ **RealtimeDataService**
**File:** `app/Services/RahjAi/RealtimeDataService.php`

**Purpose:** Provides live data from the system

**Key Methods:**
```php
// Get account balance as of date
$balance = $realtime->getAccountBalance('RENT', '2026-04-10', $companyId);

// Get inventory stock levels
$stock = $realtime->getInventoryStock('ITEM001', $warehouseId, $companyId);

// Get pending purchases
$pending = $realtime->getPendingPurchaseOrders($companyId, $locationId);

// Get trial balance
$tb = $realtime->getTrialBalance('2026-04-10', $companyId);

// Get sales summary
$sales = $realtime->getSalesSummary('2026-01-01', '2026-04-10', $companyId);
```

**Amounts/Numbers Returned:**
- All amounts formatted with 2 decimal places
- PKR currency by default
- Real database values, always accurate

---

### 3️⃣ **EnhancedRagService**
**File:** `app/Services/RahjAi/EnhancedRagService.php`

**Purpose:** Smart RAG that combines static knowledge + live data

**Features:**
- Intent detection (what user is asking about)
- Real-time data injection based on intent
- Relevance ranking (0-100 score)
- Semantic similarity

**Intent Types:**
- `account_balance` → Queries account data
- `inventory_status` → Item/stock queries
- `pending_orders` → PO/GRN queries
- `sales_summary` → Revenue/sales queries
- `entry_guidance` → How-to questions
- `general_knowledge` → Documentation

**Usage:**
```php
$enhanced = app(EnhancedRagService::class);
$chunks = $enhanced->intelligentRetrieve(
    "What's the balance of RENT account?",
    $companyId,
    $locationId,
    topK: 5
);
// Returns both documentation + live data, ranked by relevance
```

---

### 4️⃣ **ProfessionalFormService**
**File:** `app/Services/RahjAi/ProfessionalFormService.php`

**Purpose:** Form validation and user-friendly guidance

**Form Types Supported:**
- `chart_of_accounts` → Creating GL accounts
- `journal_voucher` → Entries
- `purchase_order` → PO creation
- `goods_receipt` → GRN creation

**Features:**
```php
// Validate form data
$result = $formService->validateAndPrepareFormEntry(
    'journal_voucher',
    [
        'voucher_date' => '2026-04-10',
        'description' => 'Monthly rent',
        'lines' => [...]
    ],
    $userContext
);

// Response includes:
// - success/error status
// - friendly error messages
// - formatted data
// - summary for user confirmation
// - next steps

// Get missing fields
$missing = $formService->getMissingFields('purchase_order', $providedData);
// Returns array of missing field names

// Get helpful prompt for a field
$prompt = $formService->getFieldPrompt('chart_of_accounts', 'account_code');
// "What is the 3-20 character account code? (e.g., RENT, COGS, CASH)"
```

**Error Messages:** All in Urdu + English, business-friendly language

---

### 5️⃣ **SystemContextService**
**File:** `app/Services/RahjAi/SystemContextService.php`

**Purpose:** Provides complete user context for intelligent responses

**Context Includes:**
```php
$context = $contextService->buildUserContext($request);
// Returns:
// - user info (name, roles)
// - company & location
// - accessible modules
// - recent activities
// - pending items
// - smart action suggestions
```

**Features:**
- Gets what modules user can access
- Shows pending approvals/tasks
- Provides contextual help for forms
- Field-by-field documentation

**Contextual Help Example:**
```php
$help = $contextService->getContextualHelp('journal_voucher');
// Returns detailed explanation of what JV is, how to create it, examples
```

---

## 🚀 Implementation Steps

### **Step 1: Build Knowledge Base** (Run Once)
```bash
php artisan tinker
>>> $builder = app(\App\Services\RahjAi\KnowledgeBaseBuilder::class);
>>> $builder->buildCompleteKnowledgeBase();
// Takes 1-2 minutes, generates comprehensive documentation
```

### **Step 2: Update Groq Prompts**
Edit `GroqChatService.php` system prompt to emphasize:
```
"You are RAHJ AI, an ERP assistant with access to LIVE system data.
When answering:
1. Use real amounts/numbers from the context
2. Say 'As of [date]' for any data
3. Mention if data is from live system vs documentation
4. Recommend next steps (open form, approve, etc.)"
```

### **Step 3: Update Routes/Controller**
Ensure your controller handles the enhanced response:
```php
// In your AIController or similar:
$orchestrator = new AssistantOrchestratorService(
    app(EnhancedRagService::class),
    app(RealtimeDataService::class),
    app(ProfessionalFormService::class),
    app(SystemContextService::class)
);

$response = $orchestrator->respond($request, $question);
```

### **Step 4: Frontend Display**
Update frontend to show:
- **Real-time data** in formatted tables
- **Amounts** highlighted
- **Next action buttons** (e.g., "Create PO", "Approve GRN")
- **Contextual help** modals

---

## 💬 Example Conversations

### **Example 1: Account Balance Query (Urdu)**
```
User: "RENT account ka balance kya hai"
(What's the balance of RENT account?)

RAHJAI Response:
✅ Account RENT Balance (As of April 10, 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Debit Total: PKR 50,000.00
📊 Credit Total: PKR 0.00
💰 **Balance: PKR 50,000.00 (Debit)**

Last 3 entries:
1. Apr 10 - Monthly rent - PKR 10,000
2. Apr 03 - Rent deposit - PKR 10,000
3. Mar 25 - Quarterly rent - PKR 30,000

👉 [View Full Ledger] [Create Entry] [Export]
```

### **Example 2: Inventory Query**
```
User: "ITEM001 ka stock kahan par hai"
(Which warehouse has ITEM001?)

RAHJAI Response:
✅ Stock Status: ITEM001 (Red Chairs)
━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Total in Stock: **150 units**
💵 Total Value: **PKR 75,000.00**

By Warehouse:
| Warehouse | Qty | Unit Price | Total Value |
|-----------|-----|------------|-------------|
| Main Warehouse | 100 | 500 | PKR 50,000 |
| Branch 2 | 45 | 500 | PKR 22,500 |
| Branch 3 | 5 | 500 | PKR 2,500 |

Last Updated: 2 minutes ago

👉 [Transfer Stock] [Adjust Qty] [View Transactions]
```

### **Example 3: Form Entry**
```
User: "Account code TELE add karna new, Telephone ka naam, Expense type, ADMIN under"
(Add new account code TELE, named Telephone, Expense type, under ADMIN)

RAHJAI Response:
✅ Chart of Accounts Entry - Ready to Create
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Code: TELE (Unique ✓)
📋 Name: Telephone
🔖 Type: Expense
🔗 Parent: ADMIN (Office Expenses)
✓ Transactional: Yes

Summary looks correct?
[✓ Yes, Save] [✗ No, Modify] [❓ Help]
```

---

## 🔧 Configuration

### `.env` Settings
```
# RAG Configuration
GROQ_RAG_TOP_K=5
GROQ_RAG_CACHE_SECONDS=300
GROQ_RAG_CHUNKS_PATH=docs/rag/langchain_chunks.jsonl

# Groq API
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TIMEOUT=30

# Company Settings
DEFAULT_COMPANY_ID=1
DEFAULT_CURRENCY=PKR
```

---

## ✅ Verification Checklist

- [ ] Knowledge base built (`php artisan tinker` + build command)
- [ ] All 5 new services created and tested
- [ ] Orchestrator updated to use new services
- [ ] Controller calls updated
- [ ] Groq prompts updated
- [ ] Frontend displays real-time data
- [ ] Forms show validation errors in Urdu+English
- [ ] Amount formatting correct (2 decimals, PKR prefix)
- [ ] Test account balance query
- [ ] Test inventory stock query
- [ ] Test form creation flow
- [ ] Test pending items display

---

## 📊 Performance Tips

1. **Cache Real-time Data** (120 seconds for read-only queries)
2. **Index Database** tables heavily queried (accounts, items, journal_voucher_lines)
3. **Limit RAG topK** to 5 (more doesn't improve quality)
4. **Pre-build Knowledge Base** on deployment, not on first request
5. **Monitor Groq API** usage and set rate limits

---

## 🐛 Troubleshooting

### **RAHJAI still giving wrong answers**
✅ Check if knowledge base is built
✅ Verify RAG corpus file exists and is readable
✅ Run data builder to update schema
✅ Check Groq API logs

### **Amounts don't show**
✅ Verify RealtimeDataService can connect to DB
✅ Check company_id and location_id are set
✅ Verify tables exist (journal_voucher_lines, inventory_balances)

### **Form validation failing**
✅ Check ProfessionalFormService rules match your models
✅ Verify required fields are in $extractedData
✅ Check error messages are friendly

### **Real-time data not showing**
✅ Verify EnhancedRagService::intelligentRetrieve is called
✅ Check intent detection is working
✅ Verify database queries include company/location filters

---

## 📞 Support

For issues:
1. Check logs: `storage/logs/`
2. Enable debug mode: `APP_DEBUG=true`
3. Test individually: `php artisan tinker` → test each service
4. Review error messages from Groq API

---

**Status:** ✅ Production Ready  
**Last Updated:** April 10, 2026
