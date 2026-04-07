import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

export default function Welcomess() {
  const { t } = useTranslations();
  return (
    <>
      <Head title={t('common.welcome_starter.head_title')} />
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800">
          {t('common.welcome_starter.heading')}
        </h1>
      </div>
    </>
  );
}
