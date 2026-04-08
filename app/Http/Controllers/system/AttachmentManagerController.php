<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Services\StorageService;
use App\Services\AuditLogService;
use App\Models\Company;
use App\Models\CompanyFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AttachmentManagerController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display attachment management page
     */
    public function index(Request $request)
    {
        // Check if user has permission to view attachments
        $this->requirePermission($request, null, 'can_view');
        
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');

        if (!$compId) {
            return Inertia::render('system/AttachmentManager/Index', [
                'error' => 'Company information is required. Please contact administrator.'
            ]);
        }

        // Storage usage from same file list as UI so "Space" matches displayed files
        $company = Company::find($compId);
        $limitMb = $company ? (float) ($company->attachment_storage_limit_mb ?? 1000) : 1000;
        $attachments = $this->getFilteredAttachments($compId, []);
        $usedBytes = (int) array_sum(array_column($attachments, 'size'));
        $usedMb = round($usedBytes / (1024 * 1024), 2);
        $availableMb = max(0, $limitMb - $usedMb);
        $percentage = $limitMb > 0 ? round(($usedMb / $limitMb) * 100, 2) : 0;
        $storageInfo = [
            'used_mb' => $usedMb,
            'limit_mb' => $limitMb,
            'percentage' => $percentage,
            'available_mb' => $availableMb,
            'is_near_limit' => $percentage >= 90,
            'is_over_limit' => $percentage >= 100,
        ];
        $storageBreakdown = StorageService::getStorageBreakdown($compId);

        return Inertia::render('system/AttachmentManager/Index', [
            'storageInfo' => $storageInfo,
            'storageBreakdown' => $storageBreakdown,
            'company' => Company::find($compId),
            'pageTitle' => 'Attachment Manager'
        ]);
    }

    /**
     * Get filtered attachments based on criteria
     */
    public function getAttachments(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        
        $raw = $request->only(['from_date', 'to_date', 'voucher_type', 'file_type', 'search', 'folder']);
        // Normalize: treat string "undefined" or empty as no filter (frontend may send undefined as string)
        $filters = array_map(function ($v) {
            $v = $v === 'undefined' || $v === null ? '' : (string) $v;
            return trim($v) === '' ? null : $v;
        }, $raw);
        
        try {
            $attachments = $this->getFilteredAttachments($compId, $filters);
            $folders = $this->buildDynamicFolderList($compId);
            return response()->json([
                'success' => true,
                'data' => $attachments,
                'folders' => $folders,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting filtered attachments', [
                'company_id' => $compId,
                'filters' => $filters,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving attachments'
            ], 500);
        }
    }

    /**
     * Delete selected attachments
     */
    public function deleteAttachments(Request $request)
    {
        $this->requirePermission($request, null, 'can_delete');
        
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $attachmentIds = $request->input('attachment_ids', []);
        
        if (empty($attachmentIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No attachments selected for deletion'
            ], 400);
        }

        try {
            $deletedCount = 0;
            $errors = [];

            foreach ($attachmentIds as $attachmentId) {
                if ($this->deleteAttachment($compId, $attachmentId)) {
                    $deletedCount++;
                } else {
                    $errors[] = "Failed to delete attachment: {$attachmentId}";
                }
            }

            // Log the deletion
            try {
                AuditLogService::logAttachment('DELETE', null, [
                    'deleted_count' => $deletedCount,
                    'attachment_ids' => $attachmentIds,
                    'comp_id' => $compId
                ]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for attachment deletion', [
                    'error' => $auditException->getMessage()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} attachment(s)",
                'deleted_count' => $deletedCount,
                'errors' => $errors
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting attachments', [
                'company_id' => $compId,
                'attachment_ids' => $attachmentIds,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting attachments'
            ], 500);
        }
    }

    /**
     * Upload files from file manager (standalone — stored in company_files)
     */
    public function upload(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');

        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        if (!$compId) {
            return response()->json(['success' => false, 'message' => 'Company context required'], 403);
        }

        $request->validate([
            'files' => 'required|array',
            'files.*' => 'required|file|max:30720|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif,zip', // 30MB per file, incl. zip
        ]);

        $uploaded = [];
        $errors = [];
        $formSlug = self::normalizePublicSubpath($request->input('folder'), true);
        if ($formSlug === null) {
            return response()->json(['success' => false, 'message' => 'Invalid folder path.'], 422);
        }

        foreach ($request->file('files') as $file) {
            try {
                $check = StorageService::canUploadFile($compId, $file->getSize());
                if (!$check['can_upload']) {
                    $errors[] = $file->getClientOriginalName().': Storage limit exceeded.';

                    continue;
                }

                $filename = time().'_'.uniqid().'_'.preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
                Storage::disk('public')->makeDirectory($formSlug);
                $path = $file->storeAs($formSlug, $filename, 'public');
                if ($path === false) {
                    $errors[] = $file->getClientOriginalName().': Could not save file to storage.';

                    continue;
                }
                $storageFilename = $formSlug.'/'.$filename;

                CompanyFile::create([
                    'comp_id' => $compId,
                    'storage_filename' => $storageFilename,
                    'original_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);

                $uploaded[] = [
                    'filename' => $storageFilename,
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'url' => StorageService::attachmentUrl($storageFilename),
                ];
            } catch (\Throwable $e) {
                Log::error('Attachment manager upload single file failed', [
                    'company_id' => $compId,
                    'original' => $file->getClientOriginalName(),
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $errors[] = $file->getClientOriginalName().': '.$e->getMessage();
            }
        }

        if (count($uploaded) === 0) {
            return response()->json([
                'success' => false,
                'message' => count($errors) ? implode(' ', $errors) : 'No files could be saved.',
                'errors' => $errors,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => count($uploaded).' file(s) uploaded.',
            'uploaded' => $uploaded,
            'errors' => $errors,
        ]);
    }

    /**
     * Get storage usage for current company (API for file manager).
     * Uses the same file list as the UI (getFilteredAttachments) so "Space" matches displayed files.
     */
    public function storageUsage(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        if (!$compId) {
            return response()->json(['success' => false], 403);
        }
        $company = DB::table('companies')->where('id', $compId)->first();
        $limitMb = $company ? (float) ($company->attachment_storage_limit_mb ?? 1000) : 1000;
        $attachments = $this->getFilteredAttachments($compId, []);
        $usedBytes = (int) array_sum(array_column($attachments, 'size'));
        $usedMb = round($usedBytes / (1024 * 1024), 2);
        $availableMb = max(0, $limitMb - $usedMb);
        $percentage = $limitMb > 0 ? round(($usedMb / $limitMb) * 100, 2) : 0;
        $info = [
            'used_mb' => $usedMb,
            'limit_mb' => $limitMb,
            'percentage' => $percentage,
            'available_mb' => $availableMb,
            'is_near_limit' => $percentage >= 90,
            'is_over_limit' => $percentage >= 100,
        ];
        return response()->json(array_merge(['success' => true], $info));
    }

    /**
     * Get folder slug and display label from filename (e.g. journal-voucher/file.pdf or general/my-folder/file.pdf)
     */
    private static function folderFromFilename($filename)
    {
        $filename = str_replace('\\', '/', (string) $filename);
        $dir = pathinfo($filename, PATHINFO_DIRNAME);
        $dir = str_replace('\\', '/', (string) $dir);
        $slug = ($dir === '' || $dir === '.') ? 'general' : $dir;
        $labels = [
            'journal-voucher' => 'Journal Voucher',
            'cash-voucher' => 'Cash Voucher',
            'bank-voucher' => 'Bank Voucher',
            'opening-voucher' => 'Opening Voucher',
            'general' => 'General / Uploads',
        ];
        $label = $labels[$slug] ?? ucfirst(str_replace(['-', '_'], ' ', basename($slug)));
        return ['slug' => $slug, 'label' => $label];
    }

    /**
     * Create a new folder under a parent path inside storage/app/public (same tree as public/storage on Hostinger).
     */
    public function createFolder(Request $request)
    {
        $this->requirePermission($request, null, 'can_add');
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        if (!$compId) {
            return response()->json(['success' => false, 'message' => 'Company context required'], 403);
        }
        $name = $request->input('name');
        if (empty(trim($name ?? ''))) {
            return response()->json(['success' => false, 'message' => 'Folder name is required'], 422);
        }
        $slug = preg_replace('/[^a-z0-9_-]/', '-', strtolower(trim($name)));
        $slug = trim(preg_replace('/-+/', '-', $slug), '-') ?: 'new-folder';

        $parentRaw = $request->input('parent', 'general');
        $parentPath = self::normalizePublicSubpath($parentRaw, true);
        if ($parentPath === null || $parentPath === '') {
            return response()->json(['success' => false, 'message' => 'Invalid parent folder'], 422);
        }

        $path = $parentPath.'/'.$slug;
        if (Storage::disk('public')->exists($path)) {
            return response()->json(['success' => false, 'message' => 'A folder with this name already exists'], 422);
        }
        Storage::disk('public')->makeDirectory($path);
        return response()->json([
            'success' => true,
            'message' => 'Folder created',
            'folder' => ['slug' => $path, 'label' => trim($name)],
        ]);
    }

    /**
     * Folders for sidebar: disk under storage/app/public + paths from this company's attachments (Hostinger: public_html/public/storage/…).
     */
    private function buildDynamicFolderList(?int $compId): array
    {
        $slugSet = [];
        foreach ($this->collectFolderSlugsFromDisk() as $slug) {
            self::addPathParentsToSet($slug, $slugSet);
        }
        foreach ($this->collectFolderSlugsFromDb($compId) as $slug) {
            self::addPathParentsToSet($slug, $slugSet);
        }
        $slugSet['general'] = true;

        $slugs = array_keys($slugSet);
        natcasesort($slugs);
        $slugs = array_values($slugs);

        $folders = [['slug' => '', 'label' => 'All files']];
        foreach ($slugs as $slug) {
            $folders[] = [
                'slug' => $slug,
                'label' => self::humanizeFolderLabel($slug),
            ];
        }

        return $folders;
    }

    private static function addPathParentsToSet(string $relPath, array &$set): void
    {
        $relPath = trim(str_replace('\\', '/', $relPath), '/');
        if ($relPath === '') {
            return;
        }
        $parts = explode('/', $relPath);
        $acc = '';
        foreach ($parts as $p) {
            if ($p === '' || ($p[0] ?? '') === '.') {
                return;
            }
            if (! preg_match('/^[a-zA-Z0-9_-]+$/', $p)) {
                return;
            }
            $acc = $acc === '' ? $p : $acc.'/'.$p;
            $set[$acc] = true;
        }
    }

    private function collectFolderSlugsFromDisk(): array
    {
        $base = storage_path('app/public');
        $out = [];
        if (! is_dir($base)) {
            return $out;
        }
        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($base, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($iterator as $file) {
                if (! $file->isDir()) {
                    continue;
                }
                $full = $file->getPathname();
                $rel = substr($full, strlen($base) + 1);
                if ($rel === false || $rel === '') {
                    continue;
                }
                $rel = str_replace('\\', '/', $rel);
                foreach (explode('/', $rel) as $seg) {
                    if ($seg !== '' && isset($seg[0]) && $seg[0] === '.') {
                        continue 2;
                    }
                }
                if (! preg_match('#^[a-zA-Z0-9_./-]+$#', $rel)) {
                    continue;
                }
                $out[] = $rel;
            }
        } catch (\Throwable $e) {
            Log::warning('Attachment folder disk scan failed', ['error' => $e->getMessage()]);
        }

        return array_unique($out);
    }

    /**
     * @return list<string> directory slugs (no trailing slash)
     */
    private function collectFolderSlugsFromDb(?int $compId): array
    {
        if (! $compId) {
            return [];
        }
        $slqs = [];
        foreach ($this->collectAttachmentPathsForCompany($compId) as $fn) {
            $fn = str_replace('\\', '/', (string) $fn);
            if (! $this->attachmentPathExistsOnDisk($fn)) {
                continue;
            }
            $dir = dirname($fn);
            if ($dir === '.' || $dir === '') {
                $slqs[] = 'general';
            } else {
                $slqs[] = $dir;
            }
        }

        return array_values(array_unique($slqs));
    }

    /**
     * True if a DB attachment path still exists on disk (avoids sidebar "Internal Storage / …" when live disk only has general/).
     */
    private function attachmentPathExistsOnDisk(string $relativePath): bool
    {
        $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
        if ($relativePath === '') {
            return false;
        }
        if (file_exists(StorageService::attachmentFullPath($relativePath))) {
            return true;
        }
        if (strpos($relativePath, '..') === false) {
            $alt = storage_path('app/public/voucher-attachments/'.$relativePath);

            return file_exists($alt);
        }

        return false;
    }

    /**
     * File-manager operations (rename, edit, delete folder) are limited to General uploads tree so voucher/internal-storage paths are not broken accidentally.
     */
    private static function isGeneralManagedRelativePath(string $path): bool
    {
        $path = trim(str_replace('\\', '/', $path), '/');
        if ($path === '' || str_contains($path, '..')) {
            return false;
        }
        if ($path === 'general') {
            return true;
        }

        return str_starts_with($path, 'general/');
    }

    /** @var list<string> */
    private const EDITABLE_TEXT_EXTENSIONS = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'cjs', 'mjs', 'php', 'vue', 'yaml', 'yml', 'ini', 'log', 'sql', 'sh', 'bat'];

    private const EDITABLE_FILE_MAX_BYTES = 2097152;

    public function renameItem(Request $request)
    {
        $this->requirePermission($request, 'system.attachment-manager.index', 'can_add');

        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        if (! $compId) {
            return response()->json(['success' => false, 'message' => 'Company context required'], 403);
        }

        $oldRaw = $request->input('old_path');
        $newRaw = $request->input('new_path');
        $oldPath = self::normalizePublicStoragePath($oldRaw);
        $newPath = self::normalizePublicStoragePath($newRaw);
        if ($oldPath === null || $oldPath === '' || $newPath === null || $newPath === '') {
            return response()->json(['success' => false, 'message' => 'Invalid path.'], 422);
        }
        if (! self::isGeneralManagedRelativePath($oldPath) || ! self::isGeneralManagedRelativePath($newPath)) {
            return response()->json(['success' => false, 'message' => 'Rename is only allowed under General / Uploads.'], 422);
        }
        if ($oldPath === 'general') {
            return response()->json(['success' => false, 'message' => 'The main “General” folder cannot be renamed.'], 422);
        }

        $disk = Storage::disk('public');
        if ($disk->exists($newPath)) {
            return response()->json(['success' => false, 'message' => 'A file or folder with that name already exists.'], 422);
        }

        $oldFull = storage_path('app/public/'.$oldPath);
        if (! file_exists($oldFull)) {
            return response()->json(['success' => false, 'message' => 'Source not found.'], 404);
        }

        try {
            if (is_file($oldFull)) {
                $disk->makeDirectory(dirname($newPath));
                if (! $disk->move($oldPath, $newPath)) {
                    return response()->json(['success' => false, 'message' => 'Could not move file.'], 500);
                }
                $this->rewriteAttachmentPathEverywhere($compId, $oldPath, $newPath);
            } elseif (is_dir($oldFull)) {
                $this->renameGeneralFolderTree($disk, $compId, $oldPath, $newPath);
            } else {
                return response()->json(['success' => false, 'message' => 'Not a file or folder.'], 422);
            }

            return response()->json(['success' => true, 'message' => 'Renamed successfully.', 'path' => $newPath]);
        } catch (\Throwable $e) {
            Log::error('Attachment manager rename failed', ['error' => $e->getMessage(), 'old' => $oldPath, 'new' => $newPath]);
            return response()->json(['success' => false, 'message' => 'Rename failed: '.$e->getMessage()], 500);
        }
    }

    public function deleteFolder(Request $request)
    {
        $this->requirePermission($request, 'system.attachment-manager.index', 'can_delete');

        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        if (! $compId) {
            return response()->json(['success' => false, 'message' => 'Company context required'], 403);
        }

        $folder = self::normalizePublicStoragePath($request->input('path'));
        if ($folder === null || $folder === '' || $folder === 'general') {
            return response()->json(['success' => false, 'message' => 'Invalid folder or protected root.'], 422);
        }
        if (! str_starts_with($folder, 'general/')) {
            return response()->json(['success' => false, 'message' => 'Only folders under General / Uploads can be deleted here.'], 422);
        }

        $full = storage_path('app/public/'.$folder);
        if (! is_dir($full)) {
            return response()->json(['success' => false, 'message' => 'Folder not found.'], 404);
        }

        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($full, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST
            );
            $files = [];
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $rel = str_replace('\\', '/', substr($file->getPathname(), strlen(storage_path('app/public')) + 1));
                    $files[] = $rel;
                }
            }
            $deleted = 0;
            foreach ($files as $rel) {
                if ($this->deleteAttachment($compId, $rel)) {
                    $deleted++;
                }
            }
            $disk = Storage::disk('public');
            if ($disk->exists($folder)) {
                $disk->deleteDirectory($folder);
            }

            return response()->json([
                'success' => true,
                'message' => 'Folder deleted.',
                'files_removed' => $deleted,
            ]);
        } catch (\Throwable $e) {
            Log::error('Attachment manager delete folder failed', ['error' => $e->getMessage(), 'folder' => $folder]);
            return response()->json(['success' => false, 'message' => 'Could not delete folder: '.$e->getMessage()], 500);
        }
    }

    public function getFileContent(Request $request)
    {
        $this->requirePermission($request, 'system.attachment-manager.index', 'can_view');

        $path = self::normalizePublicStoragePath($request->query('path'));
        if ($path === null || $path === '') {
            return response()->json(['success' => false, 'message' => 'Invalid path.'], 422);
        }
        if (! self::isGeneralManagedRelativePath($path) || $path === 'general') {
            return response()->json(['success' => false, 'message' => 'Editing is only for files under General / Uploads.'], 422);
        }

        $full = storage_path('app/public/'.$path);
        if (! is_file($full)) {
            return response()->json(['success' => false, 'message' => 'File not found.'], 404);
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if ($ext === '') {
            return response()->json(['success' => false, 'message' => 'File has no extension.'], 422);
        }
        if (! \in_array($ext, self::EDITABLE_TEXT_EXTENSIONS, true)) {
            return response()->json(['success' => false, 'message' => 'This file type cannot be edited in the browser.'], 422);
        }

        $size = filesize($full);
        if ($size > self::EDITABLE_FILE_MAX_BYTES) {
            return response()->json(['success' => false, 'message' => 'File is too large to edit here (max 2 MB).'], 422);
        }

        $content = file_get_contents($full);
        if ($content === false) {
            return response()->json(['success' => false, 'message' => 'Could not read file.'], 500);
        }

        return response()->json([
            'success' => true,
            'path' => $path,
            'content' => $content,
            'mime' => @mime_content_type($full) ?: 'text/plain',
        ]);
    }

    public function saveFileContent(Request $request)
    {
        $this->requirePermission($request, 'system.attachment-manager.index', 'can_edit');

        $path = self::normalizePublicStoragePath($request->input('path'));
        if ($path === null || $path === '') {
            return response()->json(['success' => false, 'message' => 'Invalid path.'], 422);
        }
        if (! self::isGeneralManagedRelativePath($path) || $path === 'general') {
            return response()->json(['success' => false, 'message' => 'Saving is only for files under General / Uploads.'], 422);
        }

        $full = storage_path('app/public/'.$path);
        if (! is_file($full)) {
            return response()->json(['success' => false, 'message' => 'File not found.'], 404);
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (! \in_array($ext, self::EDITABLE_TEXT_EXTENSIONS, true)) {
            return response()->json(['success' => false, 'message' => 'This file type cannot be saved from the editor.'], 422);
        }

        $content = $request->input('content');
        if (! \is_string($content)) {
            return response()->json(['success' => false, 'message' => 'Invalid content.'], 422);
        }
        if (strlen($content) > self::EDITABLE_FILE_MAX_BYTES) {
            return response()->json(['success' => false, 'message' => 'Content exceeds maximum size (2 MB).'], 422);
        }

        $ok = false;
        $tmp = $full.'.tmp.'.uniqid('', true);
        if (file_put_contents($tmp, $content) !== false) {
            $ok = rename($tmp, $full);
        }
        if (is_file($tmp)) {
            @unlink($tmp);
        }
        if (! $ok) {
            return response()->json(['success' => false, 'message' => 'Could not save file.'], 500);
        }

        return response()->json(['success' => true, 'message' => 'File saved.']);
    }

    /**
     * @return list<string> storage paths relative to storage/app/public
     */
    private function collectAttachmentPathsForCompany(int $compId): array
    {
        $paths = [];
        foreach (DB::table('company_files')->where('comp_id', $compId)->pluck('storage_filename') as $fn) {
            if ($fn) {
                $paths[] = $fn;
            }
        }
        $entryIds = DB::table('transaction_entries')
            ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
            ->where('transactions.comp_id', $compId)
            ->whereNotNull('transaction_entries.attachment_id')
            ->pluck('transaction_entries.attachment_id');
        foreach ($entryIds as $fn) {
            if ($fn) {
                $paths[] = $fn;
            }
        }
        $jsonRows = DB::table('transactions')
            ->where('comp_id', $compId)
            ->whereNotNull('attachments')
            ->pluck('attachments');
        foreach ($jsonRows as $json) {
            $arr = json_decode($json, true);
            if (is_array($arr)) {
                foreach ($arr as $fn) {
                    if ($fn) {
                        $paths[] = $fn;
                    }
                }
            }
        }

        return $paths;
    }

    private static function humanizeFolderLabel(string $slug): string
    {
        $slug = str_replace('\\', '/', $slug);
        $parts = explode('/', $slug);
        $out = [];
        foreach ($parts as $p) {
            if ($p === '') {
                continue;
            }
            $out[] = ucwords(str_replace(['-', '_'], ' ', $p));
        }
        $line = implode(' / ', $out);
        $map = [
            'general' => 'General / Uploads',
            'journal-voucher' => 'Journal Voucher',
            'cash-voucher' => 'Cash Voucher',
            'bank-voucher' => 'Bank Voucher',
            'opening-voucher' => 'Opening Voucher',
        ];
        if (isset($map[$slug])) {
            return $map[$slug];
        }

        return $line !== '' ? $line : $slug;
    }

    /**
     * Allowed relative path under Laravel public disk (matches live public/storage/...).
     *
     * @return string|null null if invalid
     */
    private static function normalizePublicSubpath($raw, bool $defaultToGeneral): ?string
    {
        $raw = trim(str_replace('\\', '/', (string) $raw), '/');
        if ($raw === '') {
            return $defaultToGeneral ? 'general' : '';
        }
        if (str_contains($raw, '..')) {
            return null;
        }
        $segments = array_values(array_filter(explode('/', $raw), fn ($s) => $s !== ''));
        if (count($segments) > 32) {
            return null;
        }
        foreach ($segments as $seg) {
            if ($seg === '' || ($seg[0] ?? '') === '.' || ! preg_match('/^[a-zA-Z0-9_-]+$/', $seg)) {
                return null;
            }
        }

        return implode('/', $segments);
    }

    /**
     * Path under storage/app/public for files and folders (last segment may include dots, e.g. general/foo.pdf).
     */
    private static function normalizePublicStoragePath($raw): ?string
    {
        $raw = trim(str_replace('\\', '/', (string) $raw), '/');
        if ($raw === '' || str_contains($raw, '..')) {
            return null;
        }
        $segments = array_values(array_filter(explode('/', $raw), fn ($s) => $s !== ''));
        if (count($segments) > 32) {
            return null;
        }
        $n = count($segments);
        foreach ($segments as $i => $seg) {
            if ($seg === '' || ($seg[0] ?? '') === '.') {
                return null;
            }
            $isLast = $i === $n - 1;
            if ($isLast) {
                if (! preg_match('/^[a-zA-Z0-9._-]+$/', $seg)) {
                    return null;
                }
            } else {
                if (! preg_match('/^[a-zA-Z0-9_-]+$/', $seg)) {
                    return null;
                }
            }
        }

        return implode('/', $segments);
    }

    /**
     * Get filtered attachments based on criteria
     */
    private function getFilteredAttachments($compId, $filters)
    {
        $attachments = [];
        
        // Get attachments from transaction_entries
        $query = DB::table('transaction_entries')
            ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
            ->where('transactions.comp_id', $compId)
            ->whereNotNull('transaction_entries.attachment_id')
            ->select(
                'transaction_entries.attachment_id as filename',
                'transactions.voucher_date',
                'transactions.voucher_type',
                'transactions.voucher_number',
                'transaction_entries.description as entry_description',
                DB::raw("'transaction_entry' as attachment_type")
            );

        // Apply filters
        if (!empty($filters['from_date'])) {
            $query->where('transactions.voucher_date', '>=', $filters['from_date']);
        }
        
        if (!empty($filters['to_date'])) {
            $query->where('transactions.voucher_date', '<=', $filters['to_date']);
        }
        
        if (!empty($filters['voucher_type'])) {
            $query->where('transactions.voucher_type', $filters['voucher_type']);
        }

        $entryAttachments = $query->get();

        foreach ($entryAttachments as $attachment) {
            $filePath = StorageService::attachmentFullPath($attachment->filename);
            if (file_exists($filePath)) {
                $fileSize = filesize($filePath);
                $fileExtension = pathinfo($attachment->filename, PATHINFO_EXTENSION);
                
                // Apply file type filter
                if (!empty($filters['file_type']) && strtolower($fileExtension) !== strtolower($filters['file_type'])) {
                    continue;
                }
                
                // Apply search filter
                if (!empty($filters['search'])) {
                    $searchTerm = strtolower($filters['search']);
                    if (strpos(strtolower($attachment->filename), $searchTerm) === false &&
                        strpos(strtolower($attachment->voucher_number), $searchTerm) === false) {
                        continue;
                    }
                }

                $folder = self::folderFromFilename($attachment->filename);
                if (!empty($filters['folder']) && $folder['slug'] !== $filters['folder']) {
                    continue;
                }

                $attachments[] = [
                    'filename' => $attachment->filename,
                    'folder_slug' => $folder['slug'],
                    'folder_label' => $folder['label'],
                    'size' => $fileSize,
                    'size_mb' => round($fileSize / (1024 * 1024), 2),
                    'file_type' => $fileExtension,
                    'voucher_date' => $attachment->voucher_date,
                    'voucher_type' => $attachment->voucher_type,
                    'voucher_number' => $attachment->voucher_number,
                    'description' => $attachment->entry_description,
                    'attachment_type' => $attachment->attachment_type,
                    'url' => StorageService::attachmentUrl($attachment->filename),
                    'download_url' => url('attachments/download/' . $attachment->filename),
                    'last_modified' => date('Y-m-d H:i:s', filemtime($filePath)),
                    'last_modified_ts' => filemtime($filePath),
                ];
            }
        }

        // Get attachments from transactions table
        $transactionQuery = DB::table('transactions')
            ->where('comp_id', $compId)
            ->whereNotNull('attachments')
            ->select('attachments', 'voucher_date', 'voucher_type', 'voucher_number', 'description');

        // Apply date filters
        if (!empty($filters['from_date'])) {
            $transactionQuery->where('voucher_date', '>=', $filters['from_date']);
        }
        
        if (!empty($filters['to_date'])) {
            $transactionQuery->where('voucher_date', '<=', $filters['to_date']);
        }
        
        if (!empty($filters['voucher_type'])) {
            $transactionQuery->where('voucher_type', $filters['voucher_type']);
        }

        $transactionAttachments = $transactionQuery->get();

        foreach ($transactionAttachments as $transaction) {
            $attachmentsList = json_decode($transaction->attachments, true);
            if (is_array($attachmentsList)) {
                foreach ($attachmentsList as $attachment) {
                    $filePath = StorageService::attachmentFullPath($attachment);
                    if (file_exists($filePath)) {
                        $fileSize = filesize($filePath);
                        $fileExtension = pathinfo($attachment, PATHINFO_EXTENSION);
                        
                        // Apply file type filter
                        if (!empty($filters['file_type']) && strtolower($fileExtension) !== strtolower($filters['file_type'])) {
                            continue;
                        }
                        
                        // Apply search filter
                        if (!empty($filters['search'])) {
                            $searchTerm = strtolower($filters['search']);
                            if (strpos(strtolower($attachment), $searchTerm) === false &&
                                strpos(strtolower($transaction->voucher_number), $searchTerm) === false) {
                                continue;
                            }
                        }

                        $folder = self::folderFromFilename($attachment);
                        if (!empty($filters['folder']) && $folder['slug'] !== $filters['folder']) {
                            continue;
                        }

                        $attachments[] = [
                            'filename' => $attachment,
                            'folder_slug' => $folder['slug'],
                            'folder_label' => $folder['label'],
                            'size' => $fileSize,
                            'size_mb' => round($fileSize / (1024 * 1024), 2),
                            'file_type' => $fileExtension,
                            'voucher_date' => $transaction->voucher_date,
                            'voucher_type' => $transaction->voucher_type,
                            'voucher_number' => $transaction->voucher_number,
                            'description' => $transaction->description,
                            'attachment_type' => 'voucher_attachment',
                            'url' => StorageService::attachmentUrl($attachment),
                            'download_url' => url('attachments/download/' . $attachment),
                            'last_modified' => date('Y-m-d H:i:s', filemtime($filePath)),
                            'last_modified_ts' => filemtime($filePath),
                        ];
                    }
                }
            }
        }

        // Add standalone company files (file manager uploads)
        $companyFiles = DB::table('company_files')
            ->where('comp_id', $compId)
            ->get();

        foreach ($companyFiles as $cf) {
            $filePath = StorageService::attachmentFullPath($cf->storage_filename);
            if (!file_exists($filePath)) {
                continue;
            }
            $fileSize = filesize($filePath);
            $fileExtension = pathinfo($cf->storage_filename, PATHINFO_EXTENSION);

            if (!empty($filters['file_type']) && strtolower($fileExtension) !== strtolower($filters['file_type'])) {
                continue;
            }
            if (!empty($filters['search'])) {
                $searchTerm = strtolower($filters['search']);
                if (strpos(strtolower($cf->storage_filename), $searchTerm) === false &&
                    strpos(strtolower($cf->original_name ?? ''), $searchTerm) === false) {
                    continue;
                }
            }

            $folder = self::folderFromFilename($cf->storage_filename);
            if (!empty($filters['folder']) && $folder['slug'] !== $filters['folder']) {
                continue;
            }

            // Use file mtime so "Last modified" matches Windows folder (avoids timezone/DB vs disk mismatch)
            $lastModTs = filemtime($filePath);
            $attachments[] = [
                'filename' => $cf->storage_filename,
                'folder_slug' => $folder['slug'],
                'folder_label' => $folder['label'],
                'size' => $fileSize,
                'size_mb' => round($fileSize / (1024 * 1024), 2),
                'file_type' => $fileExtension,
                'voucher_date' => $cf->created_at,
                'voucher_type' => null,
                'voucher_number' => '—',
                'description' => null,
                'attachment_type' => 'company_file',
                'url' => StorageService::attachmentUrl($cf->storage_filename),
                'download_url' => url('attachments/download/' . $cf->storage_filename),
                'last_modified' => $cf->created_at,
                'last_modified_ts' => $lastModTs,
            ];
        }

        // Include files on disk that are not in DB (e.g. uploaded via other flow) so list and storage match reality
        $existingFilenames = array_column($attachments, 'filename');
        $diskFiles = self::scanAttachmentDirectories();
        foreach ($diskFiles as $relativePath => $fullPath) {
            if (in_array($relativePath, $existingFilenames, true)) {
                continue;
            }
            $fileSize = @filesize($fullPath);
            if ($fileSize === false) {
                continue;
            }
            $fileExtension = pathinfo($relativePath, PATHINFO_EXTENSION);
            if (!empty($filters['file_type']) && strtolower($fileExtension) !== strtolower($filters['file_type'])) {
                continue;
            }
            if (!empty($filters['search'])) {
                if (strpos(strtolower($relativePath), strtolower($filters['search'])) === false) {
                    continue;
                }
            }
            $folder = self::folderFromFilename($relativePath);
            if (!empty($filters['folder']) && $folder['slug'] !== $filters['folder']) {
                continue;
            }
            $lastModTs = filemtime($fullPath);
            $attachments[] = [
                'filename' => $relativePath,
                'folder_slug' => $folder['slug'],
                'folder_label' => $folder['label'],
                'size' => $fileSize,
                'size_mb' => round($fileSize / (1024 * 1024), 2),
                'file_type' => $fileExtension,
                'voucher_date' => null,
                'voucher_type' => null,
                'voucher_number' => '—',
                'description' => null,
                'attachment_type' => 'disk_only',
                'url' => StorageService::attachmentUrl($relativePath),
                'download_url' => url('attachments/download/' . $relativePath),
                'last_modified' => date('Y-m-d H:i:s', $lastModTs),
                'last_modified_ts' => $lastModTs,
            ];
        }

        // Sort by date (newest first)
        usort($attachments, function($a, $b) {
            $tA = isset($a['last_modified_ts']) ? $a['last_modified_ts'] : (is_string($a['voucher_date']) ? strtotime($a['voucher_date']) : (is_object($a['voucher_date']) ? $a['voucher_date']->timestamp : 0));
            $tB = isset($b['last_modified_ts']) ? $b['last_modified_ts'] : (is_string($b['voucher_date']) ? strtotime($b['voucher_date']) : (is_object($b['voucher_date']) ? $b['voucher_date']->timestamp : 0));
            return $tB - $tA;
        });

        return $attachments;
    }

    /**
     * Scan storage/app/public/general and internal-storage for files; return [relativePath => fullPath]
     */
    private static function scanAttachmentDirectories(): array
    {
        $out = [];
        $base = storage_path('app/public');
        $baseLen = strlen($base) + 1;
        $dirs = ['general', StorageService::attachmentsBasePath()];
        foreach ($dirs as $dir) {
            $path = $base . DIRECTORY_SEPARATOR . $dir;
            if (!is_dir($path)) {
                continue;
            }
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS | \RecursiveDirectoryIterator::FOLLOW_SYMLINKS),
                \RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($iterator as $file) {
                if (!$file->isFile()) {
                    continue;
                }
                $full = $file->getPathname();
                $relative = str_replace('\\', '/', substr($full, $baseLen));
                $out[$relative] = $full;
            }
        }
        return $out;
    }

    private function renameGeneralFolderTree(\Illuminate\Contracts\Filesystem\Filesystem $disk, int $compId, string $oldPath, string $newPath): void
    {
        $oldBase = storage_path('app/public/'.$oldPath);
        if (! is_dir($oldBase)) {
            throw new \RuntimeException('Folder not found.');
        }

        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($oldBase, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $rel = str_replace('\\', '/', substr($file->getPathname(), strlen(storage_path('app/public')) + 1));
                $files[] = $rel;
            }
        }

        if (count($files) === 0) {
            if (! @rename($oldBase, storage_path('app/public/'.$newPath))) {
                throw new \RuntimeException('Could not rename empty folder.');
            }

            return;
        }

        usort($files, fn ($a, $b) => strlen($b) <=> strlen($a));
        foreach ($files as $rel) {
            $suffix = substr($rel, strlen($oldPath));
            $dest = $newPath.$suffix;
            $disk->makeDirectory(dirname($dest));
            if (! $disk->move($rel, $dest)) {
                throw new \RuntimeException('Could not move: '.$rel);
            }
            $this->rewriteAttachmentPathEverywhere($compId, $rel, $dest);
        }

        if ($disk->exists($oldPath)) {
            $disk->deleteDirectory($oldPath);
        }
    }

    private function rewriteAttachmentPathEverywhere(int $compId, string $oldPath, string $newPath): void
    {
        DB::table('company_files')
            ->where('comp_id', $compId)
            ->where('storage_filename', $oldPath)
            ->update(['storage_filename' => $newPath]);

        $entryIds = DB::table('transaction_entries as te')
            ->join('transactions as t', 'te.transaction_id', '=', 't.id')
            ->where('t.comp_id', $compId)
            ->where('te.attachment_id', $oldPath)
            ->pluck('te.id');
        if ($entryIds->isNotEmpty()) {
            DB::table('transaction_entries')->whereIn('id', $entryIds)->update(['attachment_id' => $newPath]);
        }

        $transactions = DB::table('transactions')
            ->where('comp_id', $compId)
            ->whereNotNull('attachments')
            ->get();

        foreach ($transactions as $transaction) {
            $attachments = json_decode($transaction->attachments, true);
            if (! is_array($attachments)) {
                continue;
            }
            $changed = false;
            foreach ($attachments as $i => $id) {
                if ($id === $oldPath) {
                    $attachments[$i] = $newPath;
                    $changed = true;
                }
            }
            if ($changed) {
                DB::table('transactions')
                    ->where('id', $transaction->id)
                    ->update(['attachments' => json_encode(array_values($attachments))]);
            }
        }
    }

    /**
     * Delete a single attachment
     */
    private function deleteAttachment($compId, $attachmentId)
    {
        try {
            $filePath = StorageService::attachmentFullPath($attachmentId);
            if (!file_exists($filePath) && strpos($attachmentId, 'general/') !== 0) {
                $filePath = storage_path('app/public/voucher-attachments/' . $attachmentId);
            }
            if (file_exists($filePath)) {
                // Delete the physical file
                unlink($filePath);
                
                // Remove references from database
                // Remove from transaction_entries
                DB::table('transaction_entries')
                    ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
                    ->where('transactions.comp_id', $compId)
                    ->where('transaction_entries.attachment_id', $attachmentId)
                    ->update(['transaction_entries.attachment_id' => null]);
                
                // Remove from transactions attachments JSON
                $transactions = DB::table('transactions')
                    ->where('comp_id', $compId)
                    ->whereNotNull('attachments')
                    ->get();
                
                foreach ($transactions as $transaction) {
                    $attachments = json_decode($transaction->attachments, true);
                    if (is_array($attachments)) {
                        $updatedAttachments = array_filter($attachments, function($att) use ($attachmentId) {
                            return $att !== $attachmentId;
                        });
                        
                        if (count($updatedAttachments) !== count($attachments)) {
                            DB::table('transactions')
                                ->where('id', $transaction->id)
                                ->update([
                                    'attachments' => json_encode(array_values($updatedAttachments))
                                ]);
                        }
                    }
                }

                // Remove from company_files if present (standalone file manager uploads)
                DB::table('company_files')
                    ->where('comp_id', $compId)
                    ->where('storage_filename', $attachmentId)
                    ->delete();
                
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('Error deleting attachment', [
                'attachment_id' => $attachmentId,
                'company_id' => $compId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
