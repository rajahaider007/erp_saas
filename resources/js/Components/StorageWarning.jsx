import React, { useState, useEffect } from 'react';
import { AlertTriangle, HardDrive, Trash2, Settings } from 'lucide-react';

const StorageWarning = ({ companyId, showDetails = false }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorageInfo();
  }, [companyId]);

  const fetchStorageInfo = async () => {
    try {
      const response = await fetch(`/api/storage-usage/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      }
    } catch (error) {
      console.error('Error fetching storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !storageInfo) {
    return null;
  }

  // Only show warning if near limit or over limit
  if (!storageInfo.is_near_limit && !storageInfo.is_over_limit) {
    return null;
  }

  const getWarningColor = () => {
    if (storageInfo.is_over_limit) return 'bg-red-500';
    if (storageInfo.is_near_limit) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getWarningText = () => {
    if (storageInfo.is_over_limit) {
      return `Storage limit exceeded! Used ${storageInfo.used_mb}MB of ${storageInfo.limit_mb}MB. Delete old attachments to upload more files.`;
    }
    if (storageInfo.is_near_limit) {
      return `⚠️ Storage almost full! Used ${storageInfo.used_mb}MB of ${storageInfo.limit_mb}MB (${storageInfo.percentage}%). Only ${storageInfo.available_mb}MB remaining.`;
    }
    return '';
  };

  return (
    <div className="storage-warning-container">
      {/* Marquee Warning */}
      <div className={`${getWarningColor()} text-white py-2 overflow-hidden`}>
        <div className="marquee-container">
          <div className="marquee-content flex items-center gap-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap font-medium">
              {getWarningText()}
            </span>
            <span className="whitespace-nowrap">
              • Get more space • Delete old attachments • Manage storage
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Storage Info (if showDetails is true) */}
      {showDetails && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Storage Usage Details
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                storageInfo.is_over_limit 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : storageInfo.is_near_limit
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {storageInfo.percentage}% Used
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  storageInfo.is_over_limit 
                    ? 'bg-red-500' 
                    : storageInfo.is_near_limit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              ></div>
            </div>

            {/* Storage Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {storageInfo.used_mb} MB
                </div>
                <div className="text-gray-500 dark:text-gray-400">Used</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {storageInfo.available_mb} MB
                </div>
                <div className="text-gray-500 dark:text-gray-400">Available</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {storageInfo.limit_mb} MB
                </div>
                <div className="text-gray-500 dark:text-gray-400">Total Limit</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => window.location.href = '/system/attachment-manager'}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Manage Attachments
              </button>
              <button
                onClick={() => window.location.href = '/system/companies'}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                <Settings className="w-3 h-3" />
                Storage Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageWarning;
