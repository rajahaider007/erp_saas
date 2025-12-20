<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use App\Services\AuditLogService;
use App\Services\StorageService;

class AttachmentController extends Controller
{
    /**
     * Upload voucher attachments
     */
    public function uploadAttachments(Request $request)
    {
        Log::info('=== ATTACHMENT UPLOAD STARTED ===');
        
        try {
            // Handle both multiple files (attachments.*) and single file (attachment)
            if ($request->hasFile('attachments')) {
                $request->validate([
                    'attachments.*' => 'required|file|max:300|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif'
                ]);
            } elseif ($request->hasFile('attachment')) {
                $request->validate([
                    'attachment' => 'required|file|max:300|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No files provided'
                ], 422);
            }

            $uploadedAttachments = [];
            $userId = session('user_id');
            $compId = session('user_comp_id');
            $locationId = session('user_location_id');

            // Check storage limits before processing files
            $filesToCheck = [];
            if ($request->hasFile('attachments')) {
                $filesToCheck = $request->file('attachments');
            } elseif ($request->hasFile('attachment')) {
                $filesToCheck = [$request->file('attachment')];
            }

            foreach ($filesToCheck as $file) {
                $uploadCheck = StorageService::canUploadFile($compId, $file->getSize());
                if (!$uploadCheck['can_upload']) {
                    $storageInfo = $uploadCheck['current_usage'];
                    $warningMessage = StorageService::getStorageWarningMessage($compId);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Storage limit exceeded. ' . $warningMessage,
                        'storage_info' => $storageInfo
                    ], 413); // 413 Payload Too Large
                }
            }

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('public/voucher-attachments', $filename);
                    
                    $attachmentData = [
                        'id' => $filename, // Use filename as ID for now
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'url' => url('storage/voucher-attachments/' . $filename)
                    ];
                    
                    $uploadedAttachments[] = $attachmentData;
                    
                    // Log each file upload
                    try {
                        AuditLogService::logAttachment('UPLOAD', null, [
                            'filename' => $filename,
                            'original_name' => $file->getClientOriginalName(),
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                            'storage_path' => $path,
                            'ip_address' => $request->ip(),
                            'user_agent' => $request->header('User-Agent'),
                            'comp_id' => $compId,
                            'location_id' => $locationId
                        ]);
                        Log::info('File uploaded successfully', [
                            'filename' => $filename,
                            'original_name' => $file->getClientOriginalName(),
                            'size' => $file->getSize(),
                            'user_id' => $userId
                        ]);
                    } catch (\Exception $auditException) {
                        Log::warning('Failed to create audit log for file upload', [
                            'filename' => $filename,
                            'error' => $auditException->getMessage()
                        ]);
                    }
                }
            } elseif ($request->hasFile('attachment')) {
                // Handle single file upload (for entry attachments)
                $file = $request->file('attachment');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('public/voucher-attachments', $filename);
                
                $attachmentData = [
                    'id' => $filename, // Use filename as ID for now
                    'filename' => $filename,
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'url' => url('storage/voucher-attachments/' . $filename)
                ];
                
                $uploadedAttachments[] = $attachmentData;
                
                // Log file upload
                try {
                    AuditLogService::logAttachment('UPLOAD', null, [
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'storage_path' => $path,
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->header('User-Agent'),
                        'comp_id' => $compId,
                        'location_id' => $locationId
                    ]);
                    Log::info('Single file uploaded successfully', [
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'user_id' => $userId
                    ]);
                } catch (\Exception $auditException) {
                    Log::warning('Failed to create audit log for single file upload', [
                        'filename' => $filename,
                        'error' => $auditException->getMessage()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Attachments uploaded successfully',
                'attachments' => $uploadedAttachments
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Attachment upload validation failed', [
                'errors' => $e->errors(),
                'files_count' => $request->hasFile('attachments') ? count((array)$request->file('attachments')) : ($request->hasFile('attachment') ? 1 : 0)
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', Arr::flatten($e->errors()))
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error uploading attachments', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'files_count' => $request->hasFile('attachments') ? count((array)$request->file('attachments')) : ($request->hasFile('attachment') ? 1 : 0)
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error uploading attachments: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Serve voucher attachment files
     */
    public function serveVoucherAttachment(Request $request, $filename)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            abort(403, 'Unauthorized access');
        }

        // Validate filename to prevent directory traversal
        if (preg_match('/[^a-zA-Z0-9._-]/', $filename)) {
            abort(400, 'Invalid filename');
        }

        $filePath = storage_path('app/public/voucher-attachments/' . $filename);
        
        // Check if file exists
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }

        // Get file info
        $mimeType = mime_content_type($filePath);
        $fileSize = filesize($filePath);
        
        // Log file access
        try {
            $userId = session('user_id');
            $compId = session('user_comp_id');
            $locationId = session('user_location_id');
            
            AuditLogService::logAttachment('VIEW', null, [
                'filename' => $filename,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'action' => 'serve',
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            Log::info('File served successfully', [
                'filename' => $filename,
                'user_id' => $userId,
                'file_size' => $fileSize
            ]);
        } catch (\Exception $auditException) {
            Log::warning('Failed to create audit log for file serve', [
                'filename' => $filename,
                'error' => $auditException->getMessage()
            ]);
        }
        
        // Set appropriate headers
        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => $fileSize,
            'Cache-Control' => 'public, max-age=3600',
            'Content-Disposition' => 'inline; filename="' . $filename . '"'
        ];

        // For downloads, you can use:
        // $headers['Content-Disposition'] = 'attachment; filename="' . $filename . '"';

        return response()->file($filePath, $headers);
    }

    /**
     * Download voucher attachment files
     */
    public function downloadVoucherAttachment(Request $request, $filename)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            abort(403, 'Unauthorized access');
        }

        // Validate filename to prevent directory traversal
        if (preg_match('/[^a-zA-Z0-9._-]/', $filename)) {
            abort(400, 'Invalid filename');
        }

        $filePath = storage_path('app/public/voucher-attachments/' . $filename);
        
        // Check if file exists
        if (!file_exists($filePath)) {
            abort(404, 'File not found');
        }

        // Log file download
        try {
            $userId = session('user_id');
            $compId = session('user_comp_id');
            $locationId = session('user_location_id');
            $fileSize = filesize($filePath);
            $mimeType = mime_content_type($filePath);
            
            AuditLogService::logAttachment('DOWNLOAD', null, [
                'filename' => $filename,
                'file_size' => $fileSize,
                'mime_type' => $mimeType,
                'action' => 'download',
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'comp_id' => $compId,
                'location_id' => $locationId
            ]);
            Log::info('File downloaded successfully', [
                'filename' => $filename,
                'user_id' => $userId,
                'file_size' => $fileSize
            ]);
        } catch (\Exception $auditException) {
            Log::warning('Failed to create audit log for file download', [
                'filename' => $filename,
                'error' => $auditException->getMessage()
            ]);
        }

        return response()->download($filePath, $filename);
    }

    /**
     * List voucher attachments for a specific voucher
     */
    public function listVoucherAttachments(Request $request, $voucherId)
    {
        Log::info('=== LIST VOUCHER ATTACHMENTS STARTED ===');
        
        try {
            // Check if user is authenticated
            if (!Auth::check()) {
                abort(403, 'Unauthorized access');
            }

            // Get voucher to verify access
            $voucher = DB::table('transactions')
                ->where('id', $voucherId)
                ->where('comp_id', $request->input('user_comp_id'))
                ->where('location_id', $request->input('user_location_id'))
                ->first();

            if (!$voucher) {
                abort(404, 'Voucher not found');
            }

            $attachments = [];
            if ($voucher->attachments) {
                $attachmentIds = json_decode($voucher->attachments, true);
                if (is_array($attachmentIds)) {
                    foreach ($attachmentIds as $attachmentId) {
                        $filePath = storage_path('app/public/voucher-attachments/' . $attachmentId);
                        if (file_exists($filePath)) {
                            $attachments[] = [
                                'id' => $attachmentId,
                                'name' => $attachmentId,
                                'size' => filesize($filePath),
                                'url' => url('/storage/voucher-attachments/' . $attachmentId),
                                'download_url' => url('/attachments/download/' . $attachmentId)
                            ];
                        }
                    }
                }
            }

            // Log attachment list access
            try {
                $userId = session('user_id');
                $compId = session('user_comp_id');
                $locationId = session('user_location_id');
                
                AuditLogService::logAttachment('LIST', null, [
                    'voucher_id' => $voucherId,
                    'attachments_count' => count($attachments),
                    'action' => 'list',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ]);
                Log::info('Voucher attachments listed successfully', [
                    'voucher_id' => $voucherId,
                    'attachments_count' => count($attachments),
                    'user_id' => $userId
                ]);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for attachment list', [
                    'voucher_id' => $voucherId,
                    'error' => $auditException->getMessage()
                ]);
            }

            return response()->json([
                'success' => true,
                'attachments' => $attachments
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error listing voucher attachments', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'voucher_id' => $voucherId ?? null
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error listing attachments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get storage usage for a company
     */
    public function getStorageUsage(Request $request, $companyId)
    {
        try {
            // Check if user has access to this company
            $userCompId = session('user_comp_id');
            if ($userCompId != $companyId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to company storage data'
                ], 403);
            }

            $storageInfo = StorageService::getCompanyStorageUsage($companyId);
            
            return response()->json([
                'success' => true,
                'data' => $storageInfo
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting storage usage', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving storage information'
            ], 500);
        }
    }

    /**
     * Get detailed storage breakdown for a company
     */
    public function getStorageBreakdown(Request $request, $companyId)
    {
        try {
            // Check if user has access to this company
            $userCompId = session('user_comp_id');
            if ($userCompId != $companyId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to company storage data'
                ], 403);
            }

            $breakdown = StorageService::getStorageBreakdown($companyId);
            
            return response()->json([
                'success' => true,
                'data' => $breakdown
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting storage breakdown', [
                'company_id' => $companyId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving storage breakdown'
            ], 500);
        }
    }
}