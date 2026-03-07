<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

/**
 * Loads JSON translation files from lang/{locale}/*.json and merges them
 * for use in the frontend (Inertia). Structure: one file per form/template
 * (common, login, sidebar, modules, header) for easy management.
 */
class TranslationLoaderService
{
    /** Supported locales */
    public const LOCALES = ['en', 'ur'];

    /** Default locale */
    public const DEFAULT_LOCALE = 'en';

    /** Subdirectory under lang/ (e.g. lang/en/) */
    protected string $langPath;

    public function __construct()
    {
        $this->langPath = base_path('lang');
    }

    /**
     * Get all translations for a locale as a flat namespaced array.
     * Keys: common.actions.save, login.title, sidebar.dashboard, etc.
     */
    public function loadForLocale(string $locale): array
    {
        if (! in_array($locale, self::LOCALES, true)) {
            $locale = self::DEFAULT_LOCALE;
        }

        $path = $this->langPath . DIRECTORY_SEPARATOR . $locale;
        if (! File::isDirectory($path)) {
            return $this->loadForLocale(self::DEFAULT_LOCALE);
        }

        $translations = [];
        $files = File::files($path);

        foreach ($files as $file) {
            if (strtolower($file->getExtension()) !== 'json') {
                continue;
            }
            $namespace = $file->getFilenameWithoutExtension();
            $content = json_decode(File::get($file->getPathname()), true);
            if (! is_array($content)) {
                continue;
            }
            $translations[$namespace] = $content;
        }

        return $translations;
    }

    /**
     * Get supported locales for the switcher.
     */
    public static function getSupportedLocales(): array
    {
        return [
            ['code' => 'en', 'name' => 'English', 'dir' => 'ltr'],
            ['code' => 'ur', 'name' => 'اردو', 'dir' => 'rtl'],
        ];
    }
}
