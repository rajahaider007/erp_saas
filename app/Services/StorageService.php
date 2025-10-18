<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StorageService
{
    /**
     * Get storage usage for a company
     */
    public static function getCompanyStorageUsage($companyId): array
    {
        try {
            $company = DB::table('companies')->where('id', $companyId)->first();
            if (!$company) {
                return [
                    'used_mb' => 0,
                    'limit_mb' => 1000,
                    'percentage' => 0,
                    'available_mb' => 1000,
                    'is_near_limit' => false,
                    'is_over_limit' => false
                ];
            }

            $limitMb = $company->attachment_storage_limit_mb ?? 1000;
            $usedBytes = self::calculateCompanyStorageUsage($companyId);
            $usedMb = round($usedBytes / (1024 * 1024), 2);
            $availableMb = max(0, $limitMb - $usedMb);
            $percentage = $limitMb > 0 ? round(($usedMb / $limitMb) * 100, 2) : 0;
            
            return [
                'used_mb' => $usedMb,
                'limit_mb' => $limitMb,
                'percentage' => $percentage,
                'available_mb' => $availableMb,
                'is_near_limit' => $percentage >= 90,
                'is_over_limit' => $percentage >= 100
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating storage usage', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'used_mb' => 0,
                'limit_mb' => 1000,
                'percentage' => 0,
                'available_mb' => 1000,
                'is_near_limit' => false,
                'is_over_limit' => false
            ];
        }
    }

    /**
     * Calculate total storage usage for a company in bytes
     */
    public static function calculateCompanyStorageUsage($companyId): int
    {
        try {
            $totalBytes = 0;
            
            // Get all attachment filenames for this company
            $attachments = self::getCompanyAttachments($companyId);
            
            foreach ($attachments as $attachment) {
                $filePath = storage_path('app/public/voucher-attachments/' . $attachment);
                if (file_exists($filePath)) {
                    $totalBytes += filesize($filePath);
                }
            }
            
            return $totalBytes;
        } catch (\Exception $e) {
            Log::error('Error calculating storage usage bytes', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Get all attachment filenames for a company
     */
    public static function getCompanyAttachments($companyId): array
    {
        try {
            $attachments = [];
            
            // Get attachments from transaction_entries
            $entryAttachments = DB::table('transaction_entries')
                ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
                ->where('transactions.comp_id', $companyId)
                ->whereNotNull('transaction_entries.attachment_id')
                ->pluck('transaction_entries.attachment_id')
                ->toArray();
            
            // Get attachments from transactions table
            $transactionAttachments = DB::table('transactions')
                ->where('comp_id', $companyId)
                ->whereNotNull('attachments')
                ->get()
                ->pluck('attachments')
                ->map(function($attachmentJson) {
                    if ($attachmentJson) {
                        $decoded = json_decode($attachmentJson, true);
                        return is_array($decoded) ? $decoded : [];
                    }
                    return [];
                })
                ->flatten()
                ->toArray();
            
            $attachments = array_unique(array_merge($entryAttachments, $transactionAttachments));
            
            return array_filter($attachments); // Remove null/empty values
        } catch (\Exception $e) {
            Log::error('Error getting company attachments', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Check if company can upload file of given size
     */
    public static function canUploadFile($companyId, $fileSizeBytes): array
    {
        $storageInfo = self::getCompanyStorageUsage($companyId);
        $fileSizeMb = $fileSizeBytes / (1024 * 1024);
        
        $canUpload = ($storageInfo['available_mb'] >= $fileSizeMb);
        
        return [
            'can_upload' => $canUpload,
            'current_usage' => $storageInfo,
            'file_size_mb' => $fileSizeMb,
            'would_exceed_limit' => !$canUpload
        ];
    }

    /**
     * Get storage warning message if near limit
     */
    public static function getStorageWarningMessage($companyId): ?string
    {
        $storageInfo = self::getCompanyStorageUsage($companyId);
        
        if ($storageInfo['is_over_limit']) {
            return "Storage limit exceeded! Please delete old attachments to upload more files.";
        }
        
        if ($storageInfo['is_near_limit']) {
            $available = $storageInfo['available_mb'];
            return "⚠️ Storage almost full! Only {$available} MB remaining. Consider deleting old attachments or upgrading storage limit.";
        }
        
        return null;
    }

    /**
     * Get detailed storage breakdown for company
     */
    public static function getStorageBreakdown($companyId): array
    {
        try {
            $breakdown = [
                'transaction_entries' => 0,
                'voucher_attachments' => 0,
                'total_files' => 0,
                'files' => []
            ];
            
            // Get attachments from transaction_entries
            $entryAttachments = DB::table('transaction_entries')
                ->join('transactions', 'transaction_entries.transaction_id', '=', 'transactions.id')
                ->where('transactions.comp_id', $companyId)
                ->whereNotNull('transaction_entries.attachment_id')
                ->select('transaction_entries.attachment_id', 'transactions.voucher_date', 'transactions.voucher_type')
                ->get();
            
            foreach ($entryAttachments as $attachment) {
                $filePath = storage_path('app/public/voucher-attachments/' . $attachment->attachment_id);
                if (file_exists($filePath)) {
                    $fileSize = filesize($filePath);
                    $breakdown['transaction_entries'] += $fileSize;
                    $breakdown['total_files']++;
                    $breakdown['files'][] = [
                        'filename' => $attachment->attachment_id,
                        'size' => $fileSize,
                        'type' => 'transaction_entry',
                        'voucher_date' => $attachment->voucher_date,
                        'voucher_type' => $attachment->voucher_type
                    ];
                }
            }
            
            // Get attachments from transactions table
            $transactionAttachments = DB::table('transactions')
                ->where('comp_id', $companyId)
                ->whereNotNull('attachments')
                ->select('attachments', 'voucher_date', 'voucher_type')
                ->get();
            
            foreach ($transactionAttachments as $transaction) {
                $attachments = json_decode($transaction->attachments, true);
                if (is_array($attachments)) {
                    foreach ($attachments as $attachment) {
                        $filePath = storage_path('app/public/voucher-attachments/' . $attachment);
                        if (file_exists($filePath)) {
                            $fileSize = filesize($filePath);
                            $breakdown['voucher_attachments'] += $fileSize;
                            $breakdown['total_files']++;
                            $breakdown['files'][] = [
                                'filename' => $attachment,
                                'size' => $fileSize,
                                'type' => 'voucher_attachment',
                                'voucher_date' => $transaction->voucher_date,
                                'voucher_type' => $transaction->voucher_type
                            ];
                        }
                    }
                }
            }
            
            // Convert bytes to MB
            $breakdown['transaction_entries'] = round($breakdown['transaction_entries'] / (1024 * 1024), 2);
            $breakdown['voucher_attachments'] = round($breakdown['voucher_attachments'] / (1024 * 1024), 2);
            
            return $breakdown;
        } catch (\Exception $e) {
            Log::error('Error getting storage breakdown', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            return [
                'transaction_entries' => 0,
                'voucher_attachments' => 0,
                'total_files' => 0,
                'files' => []
            ];
        }
    }
}
