import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, X, Calendar, Building2 } from 'lucide-react';

const LicenseAlert = () => {
  const { license_alert } = usePage().props;
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (license_alert && !dismissed) {
      setIsVisible(true);
    }
  }, [license_alert, dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    // Store dismissal in session storage to persist across page reloads
    sessionStorage.setItem('license_alert_dismissed', 'true');
  };

  // Check if alert was previously dismissed
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('license_alert_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  if (!isVisible || !license_alert) {
    return null;
  }

  const getAlertStyles = () => {
    switch (license_alert.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColor = () => {
    switch (license_alert.type) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`border rounded-lg shadow-lg p-4 ${getAlertStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium mb-2">
              {license_alert.title}
            </h3>
            <div className="text-sm">
              <p className="mb-2">{license_alert.message}</p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span>{license_alert.company_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Expires: {license_alert.expiry_date}</span>
                </div>
              </div>
              {license_alert.days_remaining && (
                <div className="mt-2 text-xs font-medium">
                  {license_alert.days_remaining} days remaining
                </div>
              )}
              {license_alert.days_expired && (
                <div className="mt-2 text-xs font-medium">
                  Expired {license_alert.days_expired} days ago
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={handleDismiss}
              className={`inline-flex rounded-md p-1.5 ${getIconColor()} hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-600`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseAlert;
