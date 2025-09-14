<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'ERP Financial Suite - Login') }}</title>

    <!-- Preload fonts for better performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Meta tags for better SEO and social sharing -->
    <meta name="description"
        content="Secure login to ERP Financial Suite - International standard financial management system">
    <meta name="keywords" content="ERP, Financial Management, Login, Secure Access">
    <meta name="author" content="ERP Financial Suite">
    <meta name="robots" content="noindex, nofollow">

    <!-- PWA Meta tags -->
    <meta name="theme-color" content="#7c3aed">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="ERP Login">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">

    <!-- Vite/Asset loading -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead

    <style>
        /* Loading screen styles */
        #loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease-out;
        }

        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        .loading-text {
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            font-weight: 500;
            margin-top: 20px;
            opacity: 0.8;
        }

        /* Hide loading screen when React app loads */
        .app-loaded #loading-screen {
            opacity: 0;
            pointer-events: none;
        }

        /* Ensure body has no margin/padding */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
            min-height: 100vh;
        }

        /* Error fallback styles */
        .error-fallback {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            text-align: center;
            color: white;
        }

        .error-fallback h1 {
            color: #ef4444;
            margin-bottom: 20px;
        }

        .error-fallback p {
            color: #d1d5db;
            max-width: 500px;
            line-height: 1.6;
        }

        .retry-button {
            background: linear-gradient(45deg, #7c3aed, #3b82f6);
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
            transition: transform 0.2s;
        }

        .retry-button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
     @inertia
</body>
<body>
    <!-- Loading Screen -->
    <div id="loading-screen">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading ERP Financial Suite...</div>
    </div>

    <!-- React App Mount Point -->
     @inertia

    <!-- Error Fallback (shown if React fails to load) -->
    <div id="error-fallback" class="error-fallback" style="display: none;">
        <h1>⚠️ Loading Error</h1>
        <p>
            We're having trouble loading the application. This could be due to a network issue
            or a temporary server problem. Please check your internet connection and try again.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
            🔄 Retry
        </button>
    </div>

    <!-- Global JavaScript Configuration -->
    <script>
        // Global app configuration
        window.appConfig = {
            baseUrl: '{{ url('/') }}',
            csrfToken: '{{ csrf_token() }}',
            appName: 'ERP Financial Suite',
            version: '1.0.0',
            environment: '{{ app()->environment() }}',
            locale: '{{ app()->getLocale() }}',
            timezone: '{{ config('app.timezone') }}'
        };

        // Loading screen management
        document.addEventListener('DOMContentLoaded', function() {
            // Hide loading screen after a maximum of 10 seconds
            setTimeout(function() {
                if (!document.body.classList.contains('app-loaded')) {
                    document.getElementById('loading-screen').style.display = 'none';
                    document.getElementById('error-fallback').style.display = 'flex';
                }
            }, 10000);

            // Listen for React app ready signal
            window.addEventListener('react-app-loaded', function() {
                document.body.classList.add('app-loaded');
                setTimeout(function() {
                    document.getElementById('loading-screen').style.display = 'none';
                }, 500);
            });
        });

        // Global error handler
        window.addEventListener('error', function(e) {
            console.error('Global error:', e.error);
            // You can send error reports to your logging service here
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
            // You can send error reports to your logging service here
        });

    </script>
</body>

</html>
