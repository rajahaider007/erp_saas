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

        // Get storage usage info
        $storageInfo = StorageService::getCompanyStorageUsage($compId);
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
            $folders = [
                ['slug' => '', 'label' => 'All files'],
                ['slug' => 'journal-voucher', 'label' => 'Journal Voucher'],
                ['slug' => 'cash-voucher', 'label' => 'Cash Voucher'],
                ['slug' => 'bank-voucher', 'label' => 'Bank Voucher'],
                ['slug' => 'opening-voucher', 'label' => 'Opening Voucher'],
                ['slug' => 'general', 'label' => 'General / Uploads'],
            ];
            $generalPath = storage_path('app/public/general');
            if (!is_dir($generalPath)) {
                @mkdir($generalPath, 0755, true);
            }
            if (is_dir($generalPath)) {
                $entries = @scandir($generalPath) ?: [];
                foreach ($entries as $entry) {
                    if ($entry !== '.' && $entry !== '..' && is_dir($generalPath . DIRECTORY_SEPARATOR . $entry)) {
                        $customSlug = 'general/' . $entry;
                        if (!in_array($customSlug, array_column($folders, 'slug'), true)) {
                            $folders[] = ['slug' => $customSlug, 'label' => ucfirst(str_replace(['-', '_'], ' ', $entry))];
                        }
                    }
                }
            }
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
        $subfolder = $request->input('folder', '');
        $subfolder = preg_replace('/[^a-z0-9_-]/', '', strtolower($subfolder));
        $formSlug = $subfolder ? 'general/' . $subfolder : 'general';

        foreach ($request->file('files') as $file) {
            $check = StorageService::canUploadFile($compId, $file->getSize());
            if (!$check['can_upload']) {
                $errors[] = $file->getClientOriginalName() . ': Storage limit exceeded.';
                continue;
            }

            $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
            Storage::disk('public')->makeDirectory($formSlug);
            $path = $file->storeAs($formSlug, $filename, 'public');
            $storageFilename = $formSlug . '/' . $filename;

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
        }

        return response()->json([
            'success' => true,
            'message' => count($uploaded) . ' file(s) uploaded.',
            'uploaded' => $uploaded,
            'errors' => $errors,
        ]);
    }

    /**
     * Get storage usage for current company (API for file manager)
     */
    public function storageUsage(Request $request)
    {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        if (!$compId) {
            return response()->json(['success' => false], 403);
        }
        $info = StorageService::getCompanyStorageUsage($compId);
        return response()->json(array_merge(['success' => true], $info));
    }

    /**
     * Get folder slug and display label from filename (e.g. journal-voucher/file.pdf or general/my-folder/file.pdf)
     */
    private static function folderFromFilename($filename)
    {
        $dir = pathinfo($filename, PATHINFO_DIRNAME);
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
     * Create a new folder under general (for file manager)
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
        $path = 'general/' . $slug;
        if (Storage::disk('public')->exists($path)) {
            return response()->json(['success' => false, 'message' => 'A folder with this name already exists'], 422);
        }
        Storage::disk('public')->makeDirectory($path);
        return response()->json([
            'success' => true,
            'message' => 'Folder created',
            'folder' => ['slug' => 'general/' . $slug, 'label' => trim($name)],
        ]);
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
                    'last_modified' => date('Y-m-d H:i:s', filemtime($filePath)),
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
                            'last_modified' => date('Y-m-d H:i:s', filemtime($filePath)),
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
                'last_modified' => $cf->created_at,
            ];
        }

        // Sort by date (newest first)
        usort($attachments, function($a, $b) {
            $tA = is_string($a['voucher_date']) ? strtotime($a['voucher_date']) : (is_object($a['voucher_date']) ? $a['voucher_date']->timestamp : 0);
            $tB = is_string($b['voucher_date']) ? strtotime($b['voucher_date']) : (is_object($b['voucher_date']) ? $b['voucher_date']->timestamp : 0);
            return $tB - $tA;
        });

        return $attachments;
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
