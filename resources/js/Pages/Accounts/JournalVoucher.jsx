import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

// Redirect to list page - same pattern as AddModules
const JournalVoucher = () => {
const { t } = useTranslations();
  useEffect(() => {
    router.visit('/accounts/journal-voucher');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t('accounts.journal_voucher.redirecting_to_journal_voucher')}</p>
      </div>
    </div>
  );
};

export default JournalVoucher;
