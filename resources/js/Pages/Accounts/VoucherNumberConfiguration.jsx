import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

// Redirect to list page - same pattern as AddModules
const VoucherNumberConfiguration = () => {
const { t } = useTranslations();
  useEffect(() => {
    router.visit('/accounts/voucher-number-configuration');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t('accounts.voucher_number_configuration.redirecting_to_voucher_number_configurat')}</p>
      </div>
    </div>
  );
};

export default VoucherNumberConfiguration;