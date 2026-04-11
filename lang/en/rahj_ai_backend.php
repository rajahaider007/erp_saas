<?php

return [
    'chat_unavailable' => 'RAHJ AI is temporarily unavailable (Groq or server error). Please try again in a moment. Agar masla barqarar ho to admin se API key / network check karwain.',
    'chat_unavailable_short' => 'RAHJ AI is temporarily unavailable. Please try again.',
    'groq_not_configured' => "RAHJ AI’s cloud assistant is not configured: **GROQ_API_KEY** is missing or empty in your `.env` file.\n\nAdd a valid key from [Groq Console](https://console.groq.com/keys), run `php artisan config:clear`, then try again.\n\nUntil then, features that work **without** Groq still run (for example: assisted draft links, some read-only snapshots, and Level 4 chart smart-entry when permissions allow).",
];
