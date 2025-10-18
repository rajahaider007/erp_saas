<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Services\StorageService;
use App\Services\AuditLogService;
use App\Models\Company;
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
        
        $filters = $request->only(['from_date', 'to_date', 'voucher_type', 'file_type', 'search']);
        
        try {
            $attachments = $this->getFilteredAttachments($compId, $filters);
            
            return response()->json([
                'success' => true,
                'data' => $attachments
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
            $filePath = storage_path('app/public/voucher-attachments/' . $attachment->filename);
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

                $attachments[] = [
                    'filename' => $attachment->filename,
                    'size' => $fileSize,
                    'size_mb' => round($fileSize / (1024 * 1024), 2),
                    'file_type' => $fileExtension,
                    'voucher_date' => $attachment->voucher_date,
                    'voucher_type' => $attachment->voucher_type,
                    'voucher_number' => $attachment->voucher_number,
                    'description' => $attachment->entry_description,
                    'attachment_type' => $attachment->attachment_type,
                    'url' => url('storage/voucher-attachments/' . $attachment->filename)
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
                    $filePath = storage_path('app/public/voucher-attachments/' . $attachment);
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

                        $attachments[] = [
                            'filename' => $attachment,
                            'size' => $fileSize,
                            'size_mb' => round($fileSize / (1024 * 1024), 2),
                            'file_type' => $fileExtension,
                            'voucher_date' => $transaction->voucher_date,
                            'voucher_type' => $transaction->voucher_type,
                            'voucher_number' => $transaction->voucher_number,
                            'description' => $transaction->description,
                            'attachment_type' => 'voucher_attachment',
                            'url' => url('storage/voucher-attachments/' . $attachment)
                        ];
                    }
                }
            }
        }

        // Sort by date (newest first)
        usort($attachments, function($a, $b) {
            return strtotime($b['voucher_date']) - strtotime($a['voucher_date']);
        });

        return $attachments;
    }

    /**
     * Delete a single attachment
     */
    private function deleteAttachment($compId, $attachmentId)
    {
        try {
            $filePath = storage_path('app/public/voucher-attachments/' . $attachmentId);
            
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
