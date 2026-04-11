import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import { useTranslations } from '../../hooks/useTranslations';

export default function RahjAiPrivacy() {
  const { t } = useTranslations();

  return (
    <AppLayout title={t('rahj_ai.portal.privacy_page_title')}>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/rahj-ai"
          className="btn btn-secondary mb-6 inline-flex items-center gap-2 border border-slate-300/80 bg-white/90 text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('rahj_ai.portal.privacy_back')}
        </Link>

        <div className="flex items-start gap-4 rounded-2xl border border-emerald-300/50 bg-emerald-50/90 p-5 dark:border-emerald-800/50 dark:bg-emerald-950/30">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-200">
            <Shield className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-emerald-950 dark:text-emerald-100">
              {t('rahj_ai.portal.privacy_page_title')}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-emerald-900/95 dark:text-emerald-100/90">
              {t('rahj_ai.portal.privacy_page_body')}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/85">
              {t('rahj_ai.portal.privacy_page_extra')}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
