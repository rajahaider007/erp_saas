<?php

return [
    'purchase_requisition' => [
        'errors' => [
            'company_location_required' => 'Company and Location information is required to create a purchase requisition.',
            'save_failed' => 'Could not save the purchase requisition. Please try again or contact support.',
            'not_found' => 'Purchase requisition was not found.',
            'only_draft_can_approve' => 'Only draft requisitions can be approved. This document is :status.',
            'only_draft_can_delete' => 'Only draft requisitions can be deleted. Approved documents must stay on file.',
            'bulk_approve_none' => 'No draft requisitions were found for the selection.',
            'delete_failed' => 'Could not delete the purchase requisition. Please try again or contact support.',
            'only_draft_can_edit' => 'Only draft requisitions can be edited.',
        ],
        'messages' => [
            'created' => 'Purchase requisition :number has been saved as draft.',
            'created_approved' => 'Purchase requisition :number has been saved and approved.',
            'approved' => 'Purchase requisition :number has been approved.',
            'bulk_approved' => ':count purchase requisition(s) have been approved.',
            'deleted_recycle' => 'Purchase requisition :number was moved to the recycle bin (recovery).',
            'deleted_permanent' => 'Purchase requisition :number was permanently deleted.',
            'updated' => 'Purchase requisition :number has been updated and saved as draft.',
            'updated_approved' => 'Purchase requisition :number has been updated and approved.',
        ],
    ],
    'purchase_order' => [
        'errors' => [
            'company_location_required' => 'Company and Location information is required to work with purchase orders.',
            'save_failed' => 'Could not save the purchase order. Please try again or contact support.',
            'not_found' => 'Purchase order was not found.',
            'only_draft_can_approve' => 'Only draft purchase orders can be approved. This document is :status.',
            'only_draft_can_delete' => 'Only draft purchase orders can be deleted.',
            'bulk_approve_none' => 'No draft purchase orders were found for the selection.',
            'delete_failed' => 'Could not delete the purchase order. Please try again or contact support.',
            'only_draft_can_edit' => 'Only draft purchase orders can be edited.',
            'pr_not_available' => 'This purchase requisition is not available or is not approved.',
        ],
        'messages' => [
            'created' => 'Purchase order :number has been saved as draft.',
            'created_approved' => 'Purchase order :number has been saved and approved.',
            'approved' => 'Purchase order :number has been approved.',
            'bulk_approved' => ':count purchase order(s) have been approved.',
            'deleted_recycle' => 'Purchase order :number was moved to the recycle bin (recovery).',
            'deleted_permanent' => 'Purchase order :number was permanently deleted.',
            'updated' => 'Purchase order :number has been updated and saved as draft.',
            'updated_approved' => 'Purchase order :number has been updated and approved.',
        ],
    ],
    'document_number_configuration' => [
        'errors' => [
            'company_location_required' => 'Company and Location information is required.',
            'save_failed' => 'Could not save the configuration. Please try again.',
            'not_found' => 'Configuration was not found.',
            'duplicate' => 'A configuration for this document type already exists.',
            'invalid_document_type' => 'This document type is not supported.',
        ],
        'messages' => [
            'created' => 'Document number configuration has been created.',
            'updated' => 'Document number configuration has been updated.',
            'deleted' => 'Document number configuration has been deleted.',
        ],
    ],
];
