import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, PlusCircle, Shield } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import { useTranslations } from '../../hooks/useTranslations';

export default function RahjAiGuidelines() {
  const { t } = useTranslations();

  const items = [
    { Icon: BookOpen, titleKey: 'rahj_ai.portal.guideline_erp_title', bodyKey: 'rahj_ai.portal.guideline_erp_body' },
    { Icon: Shield, titleKey: 'rahj_ai.portal.guideline_private_title', bodyKey: 'rahj_ai.portal.guideline_private_body' },
    { Icon: PlusCircle, titleKey: 'rahj_ai.portal.guideline_fresh_title', bodyKey: 'rahj_ai.portal.guideline_fresh_body' },
  ];

  return (
    <AppLayout title={t('rahj_ai.portal.guidelines_page_title')}>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/rahj-ai"
          className="btn btn-secondary mb-6 inline-flex items-center gap-2 border border-slate-300/80 bg-white/90 text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('rahj_ai.portal.guidelines_back')}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {t('rahj_ai.portal.guidelines_page_title')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t('rahj_ai.portal.guidelines_page_intro')}
        </p>

        <ul className="mt-8 space-y-4">
          {items.map(({ Icon, titleKey, bodyKey }) => (
            <li
              key={titleKey}
              className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t(titleKey)}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t(bodyKey)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
