<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'groq' => [
        'api_key' => env('GROQ_API_KEY', ''),
        'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
        'model' => env('GROQ_MODEL', 'llama-3.3-70b-versatile'),
        // Multi-model routing (one model per request). See GroqModelRouter + https://console.groq.com/docs/models
        'reasoning_model' => env('GROQ_REASONING_MODEL', 'deepseek-r1-distill-llama-70b'),
        'economy_model' => env('GROQ_ECONOMY_MODEL', 'mixtral-8x7b-32768'),
        'verifier_model' => env('GROQ_VERIFIER_MODEL', 'gemma2-9b-it'),
        'routing_mode' => env('RAHJ_GROQ_ROUTING', 'auto'),
        'answer_verify_enabled' => filter_var(env('RAHJ_AI_VERIFY_ANSWERS', 'false'), FILTER_VALIDATE_BOOLEAN),
        'timeout' => (int) env('GROQ_TIMEOUT', 30),
        'rag_chunks_path' => env('RAHJ_RAG_CHUNKS_PATH', 'docs/rag/langchain_chunks.jsonl'),
        'rag_top_k' => (int) env('RAHJ_RAG_TOP_K', 4),
        // Extra guide chunks retrieved before merge/rank (then trimmed to rag_top_k).
        'rag_corpus_extra_chunks' => (int) env('RAHJ_RAG_CORPUS_EXTRA', 3),
        'rag_cache_seconds' => (int) env('RAHJ_RAG_CACHE_SECONDS', 300),
        // Groq returns HTTP 413 if the JSON body is too large; cap grounding text.
        'max_question_chars' => (int) env('GROQ_MAX_QUESTION_CHARS', 8000),
        'max_context_chunk_chars' => (int) env('GROQ_MAX_CONTEXT_CHUNK_CHARS', 6000),
        'max_context_total_chars' => (int) env('GROQ_MAX_CONTEXT_TOTAL_CHARS', 72000),
        // Prior turns loaded from DB (same conversation) so follow-ups like "delete that code" stay grounded.
        'chat_history_max_messages' => (int) env('GROQ_CHAT_HISTORY_MAX_MESSAGES', 24),
        'chat_history_max_chars_per_message' => (int) env('GROQ_CHAT_HISTORY_MAX_CHARS_PER_MESSAGE', 3500),
        'chat_history_max_total_chars' => (int) env('GROQ_CHAT_HISTORY_MAX_TOTAL_CHARS', 16000),
        // LLM-based gate before RAG: refuses personal / medical / vulgar / unrelated chit-chat (no keyword lists).
        'scope_gate_enabled' => filter_var(env('RAHJ_SCOPE_GATE_ENABLED', 'true'), FILTER_VALIDATE_BOOLEAN),
        // Optional classifier model; defaults to main GROQ_MODEL. Set to e.g. llama-3.1-8b-instant to save cost.
        'scope_model' => env('GROQ_SCOPE_MODEL'),
    ],

];
