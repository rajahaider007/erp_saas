<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class AttachmentController extends Controller
{
    /**
     * Upload voucher attachments
     */
    public function uploadAttachments(Request $request)
    {
        try {
            $request->validate([
                'attachments.*' => 'required|file|max:300|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif'
            ]);

            $uploadedAttachments = [];

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('public/voucher-attachments', $filename);
                    
                    $uploadedAttachments[] = [
                        'id' => $filename, // Use filename as ID for now
                        'filename' => $filename,
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'url' => url('storage/voucher-attachments/' . $filename)
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Attachments uploaded successfully',
                'attachments' => $uploadedAttachments
            ]);
        } catch (\Exception $e) {
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

        return response()->download($filePath, $filename);
    }

    /**
     * List voucher attachments for a specific voucher
     */
    public function listVoucherAttachments(Request $request, $voucherId)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            abort(403, 'Unauthorized access');
        }

        // Get voucher to verify access
        $voucher = \DB::table('transactions')
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

        return response()->json([
            'success' => true,
            'attachments' => $attachments
        ]);
    }
}