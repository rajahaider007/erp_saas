# 🎯 RAHJAI - Developer Quick Reference Card

## 📋 Cheat Sheet (Copy-Paste Ready)

### **1. Build Knowledge Base** (Run Once)
```bash
# Terminal command
php artisan rahjai:build-knowledge

# Or in code
$builder = app(\App\Services\RahjAi\KnowledgeBaseBuilder::class);
$builder->buildCompleteKnowledgeBase();
```

### **2. Query Real-Time Data**
```php
use App\Services\RahjAi\RealtimeDataService;

$data = app(RealtimeDataService::class);

// Account Balance
$balance = $data->getAccountBalance('RENT', '2026-04-10', 1);
// Returns: [account_code, name, debit, credit, balance, ...]

// Inventory Stock
$stock = $data->getInventoryStock('ITEM001', warehouseId: 1, companyId: 1);
// Returns: [item_code, qty, value, warehouses[], ...]

// Pending Purchase Orders
$pos = $data->getPendingPurchaseOrders(companyId: 1, locationId: 1);
// Returns: [pending_orders_count, total_amount, orders[], ...]

// Pending GRNs
$grns = $data->getPendingGoodsReceipts(companyId: 1);
// Returns: [pending_receipts_count, receipts[], ...]

// Trial Balance
$tb = $data->getTrialBalance('2026-04-10', companyId: 1);
// Returns: [total_debit, total_credit, is_balanced, accounts[], ...]

// Sales Summary
$sales = $data->getSalesSummary('2026-01-01', '2026-04-10', companyId: 1);
// Returns: [total_orders, total_amount, by_status[], ...]
```

### **3. Use Enhanced RAG (Smart Retrieval)**
```php
use App\Services\RahjAi\EnhancedRagService;

$rag = app(EnhancedRagService::class);

$chunks = $rag->intelligentRetrieve(
    query: "What's the RENT account balance?",
    companyId: 1,
    locationId: 1,
    topK: 5  // Return top 5
);

// Returns: Merged chunks from static docs + real-time data
// Ranked by relevance (0-100 score)
// Each chunk has source_type, content, relevance_score
```

### **4. Validate Form Entry (Professional)**
```php
use App\Services\RahjAi\ProfessionalFormService;

$form = app(ProfessionalFormService::class);

$result = $form->validateAndPrepareFormEntry(
    formType: 'chart_of_accounts',  // or journal_voucher, purchase_order, goods_receipt
    extractedData: [
        'account_code' => 'TELE',
        'account_name' => 'Telephone',
        'account_type' => 'Expense',
        'parent_account_id' => 123,
        'is_transactional' => true,
    ],
    userContext: $contextService->buildUserContext($request)
);

// Returns:
// success: true/false
// status: validation_error | ready_for_submission
// errors: [...] if validation fails
// friendly_message: User-friendly error text
// data: Formatted, validated data
// summary: Confirmation text for user
// next_step: What to do next
```

### **5. Get Missing Fields** (Progressive Entry)
```php
$missing = $form->getMissingFields('purchase_order', [
    'po_date' => '2026-04-10',
    'supplier_id' => null,  // Missing!
    // expected_delivery_date missing too
]);

// Returns: ['supplier_id', 'expected_delivery_date']

// Get helpful prompt for each missing field
foreach ($missing as $field) {
    $prompt = $form->getFieldPrompt('purchase_order', $field);
    echo $prompt;
    // "Which supplier? (Provide supplier name or ID)"
}
```

### **6. System Context (User Awareness)**
```php
use App\Services\RahjAi\SystemContextService;

$context = app(SystemContextService::class);

$userContext = $context->buildUserContext($request);
// Returns: user, company, location, accessible_modules, 
//          recent_activities, pending_items, quick_actions

// Get accessible modules
$modules = $context->getAccessibleModules(auth()->user());
// Returns: accounts[], inventory[], sales[], etc.

// Get contextual help for form
$help = $context->getContextualHelp('journal_voucher');
// Returns: Detailed explanation with examples

// Get field dictionary
$dict = $context->getFieldDictionary('journal_voucher', 'line_type');
// Returns: label, description, options, rules, etc.
```

### **7. Orchestrator (All Together)**
```php
use App\Services\RahjAi\AssistantOrchestratorService;

$orchestrator = app(AssistantOrchestratorService::class);

$response = $orchestrator->respond(
    request: $request,
    question: "RENT account balance?",
    ragCorpus: app(\App\Services\RahjAi\RagCorpusService::class),
    groq: app(\App\Services\RahjAi\GroqChatService::class),
    conversationId: 1  // optional
);

// Returns:
// answer: AI response (with real amounts)
// model: groq model used
// sources: documentation chunks used
// meta: mode, language_hint, context info
```

---

## 🔑 Key Service Mapping

| Need | Service | Method |
|------|---------|--------|
| **Live amounts** | RealtimeDataService | getAccountBalance(), getSalesSummary() |
| **Stock levels** | RealtimeDataService | getInventoryStock() |
| **Pending items** | RealtimeDataService | getPendingPurchaseOrders(), getPendingGoodsReceipts() |
| **Smart answer** | EnhancedRagService | intelligentRetrieve() |
| **Form validation** | ProfessionalFormService | validateAndPrepareFormEntry() |
| **Field help** | ProfessionalFormService | getFieldPrompt() |
| **User context** | SystemContextService | buildUserContext() |
| **Documentation** | KnowledgeBaseBuilder | buildCompleteKnowledgeBase() |
| **Everything** | AssistantOrchestratorService | respond() |

---

## 📝 Service Return Formats

### RealtimeDataService - Account Balance
```javascript
{
  account_code: "RENT",
  account_name: "Office Rent Expense",
  as_of_date: "2026-04-10",
  debit_total: 50000,
  credit_total: 0,
  balance: 50000,
  balance_formatted: "50,000.00",
  currency: "PKR"
}
```

### RealtimeDataService - Inventory Stock
```javascript
{
  item_code: "ITEM001",
  item_name: "Red Chairs",
  total_quantity: 150,
  total_value: 75000,
  total_value_formatted: "75,000.00",
  warehouses: [
    {
      warehouse_id: 1,
      warehouse_name: "Main",
      quantity: 100,
      unit_price: 500,
      value: "50,000.00"
    }
  ],
  last_updated: "2026-04-10 14:30:00"
}
```

### ProfessionalFormService - Validation Result
```javascript
{
  success: false,
  status: "validation_error",
  errors: {
    account_code: ["Code must be 3-20 uppercase"],
    parent_account_id: ["Parent account does not exist"]
  },
  friendly_message: "⚠️ Please fix:\n• account_code: Code must be...\n• parent_account_id: Parent...",
  next_step: "Please correct and try again"
}
```

### ProfessionalFormService - Valid Entry
```javascript
{
  success: true,
  status: "ready_for_submission",
  data: {
    account_code: "TELE",
    account_name: "Telephone",
    account_type: "Expense",
    is_transactional: true
  },
  summary: "✅ Chart of Accounts Entry...\n📝 Code: TELE\n...",
  next_step: "Ready to save. Confirm to proceed?"
}
```

---

## 🧪 Testing Commands

```bash
# Test 1: Build Knowledge Base
php artisan rahjai:build-knowledge

# Test 2: Verify corpus file
ls -lh docs/rag/langchain_chunks.jsonl
# Should show size > 100KB

# Test 3: Test each service
php artisan tinker

# In tinker:
>>> $data = app(\App\Services\RahjAi\RealtimeDataService::class);
>>> $data->getAccountBalance('RENT', '2026-04-10', 1);
// Should return account balance data

>>> $rag = app(\App\Services\RahjAi\EnhancedRagService::class);
>>> $chunks = $rag->intelligentRetrieve("Balance?", 1, 1);
// Should return mixed real-time + documentation chunks

>>> $form = app(\App\Services\RahjAi\ProfessionalFormService::class);
>>> $form->validateAndPrepareFormEntry('chart_of_accounts', [...], [...]);
// Should return validation result

>>> $ctx = app(\App\Services\RahjAi\SystemContextService::class);
>>> $ctx->buildUserContext(request());
// Should return user context
```

---

## ⚙️ Configuration Needed

```php
// config('services.groq') in config/services.php
'groq' => [
    'api_key' => env('GROQ_API_KEY'),
    'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
    'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    'timeout' => env('GROQ_TIMEOUT', 30),
    'rag_chunks_path' => env('GROQ_RAG_CHUNKS_PATH', 'docs/rag/langchain_chunks.jsonl'),
    'rag_top_k' => env('GROQ_RAG_TOP_K', 5),
    'rag_cache_seconds' => env('GROQ_RAG_CACHE_SECONDS', 300),
],

// .env file
GROQ_API_KEY=gsk_xxx
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_RAG_CHUNKS_PATH=docs/rag/langchain_chunks.jsonl
GROQ_RAG_TOP_K=5
```

---

## 🚨 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Table not found` | DB schema doesn't match | Update table names in RealtimeDataService |
| `Empty response` | Groq API not set | Add GROQ_API_KEY to .env |
| `No amounts showing` | Real-time data not queried | Use EnhancedRagService, not basic RagCorpusService |
| `Form validation fails` | Rules don't match models | Update ProfessionalFormService::getValidationRules() |
| `Knowledge base empty` | Build command failed | Check logs: `php artisan rahjai:build-knowledge` |

---

## 📊 Performance Optimization

```php
// Cache real-time queries (2 minutes)
$cacheKey = "account_balance_{$code}_{$date}_{$companyId}";
$balance = Cache::remember($cacheKey, 120, function () use ($code, $date, $companyId) {
    return $realtime->getAccountBalance($code, $date, $companyId);
});

// Limit RAG topK
$chunks = $rag->intelligentRetrieve($query, $companyId, $locationId, topK: 5);
// Don't use topK > 10

// Pre-build knowledge base on deployment
// Run: php artisan rahjai:build-knowledge
// Not on first request!
```

---

## 🎓 Learning Path

1. **Understand Services** (10 min)
   - Read each service's docstring
   - Understand what it does

2. **Test in Tinker** (20 min)
   - Test each method
   - See return formats
   - Verify DB connection

3. **Read Flow Diagrams** (15 min)
   - `RAHJAI_DATA_FLOW_DIAGRAMS.md`
   - Understand request → response cycle

4. **Integrate in Controller** (30 min)
   - Update your AI endpoint
   - Replace basic RAG with Enhanced RAG
   - Test with real questions

5. **Deploy & Monitor** (10 min)
   - Run knowledge base builder
   - Check logs
   - Monitor API usage

**Total: ~1.5 hours from scratch to production!**

---

## ✅ Final Checklist

- [ ] All services created in `app/Services/RahjAi/`
- [ ] Artisan command created
- [ ] Knowledge base built: `php artisan rahjai:build-knowledge`
- [ ] Tested each service in tinker
- [ ] Updated controller to use new services
- [ ] Updated Groq system prompt
- [ ] Framework can call RealtimeDataService
- [ ] Forms show validation errors
- [ ] Amounts display with PKR format
- [ ] User sees real data (not static docs)

---

**Status:** Ready for Production! 🚀
**Questions?** Check the full guides in workspace root.
