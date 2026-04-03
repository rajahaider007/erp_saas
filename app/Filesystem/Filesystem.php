<?php

namespace App\Filesystem;

use Illuminate\Filesystem\Filesystem as BaseFilesystem;

/**
 * Ensures PHP built-ins are called from the global namespace (required on some
 * hosts where unqualified exec/symlink resolve incorrectly inside Illuminate\Filesystem).
 */
class Filesystem extends BaseFilesystem
{
    /**
     * @param  string  $target
     * @param  string  $link
     * @return bool|null
     */
    public function link($target, $link)
    {
        if (! \windows_os()) {
            if (\function_exists('symlink')) {
                return \symlink($target, $link);
            }

            if (\function_exists('exec')) {
                return \exec('ln -s '.\escapeshellarg($target).' '.\escapeshellarg($link)) !== false;
            }

            return false;
        }

        $mode = $this->isDirectory($target) ? 'J' : 'H';

        if (\function_exists('exec')) {
            \exec("mklink /{$mode} ".\escapeshellarg($link).' '.\escapeshellarg($target));
        }
    }
}
