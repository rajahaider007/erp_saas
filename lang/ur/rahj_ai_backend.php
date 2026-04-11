<?php

return [
    'chat_unavailable' => 'راہج AI عارضی طور پر دستیاب نہیں (Groq یا سرور کی خرابی)۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔ اگر مسئلہ رہے تو منتظم سے API کی / نیٹ ورک چیک کروائیں۔',
    'chat_unavailable_short' => 'راہج AI عارضی طور پر دستیاب نہیں۔ دوبارہ کوشش کریں۔',
    'groq_not_configured' => "راہج AI کا cloud ماڈل ابھی سیٹ نہیں: `.env` میں **GROQ_API_KEY** خالی یا موجود نہیں۔\n\n[Groq Console](https://console.groq.com/keys) سے کلید لگائیں، `php artisan config:clear` چلائیں، پھر دوبارہ کوشش کریں۔\n\nGroq کے بغیر بھی کچھ فیچر چلتے ہیں (مثلاً draft links، کچھ read-only snapshots، اور اجازت ہو تو Level 4 chart smart-entry)۔",
];
