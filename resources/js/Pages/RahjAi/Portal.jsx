import React from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, ArrowLeft, Shield, BookOpen, MessageSquare } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import RahjAiChatView from '../../Components/RahjAi/RahjAiChatView';
import { useRahjAiAssistant } from '../../Contexts/RahjAiAssistantContext';
import { useTranslations } from '../../hooks/useTranslations';

/** Must render inside AppLayout so RahjAiAssistantProvider is an ancestor (hooks run in parent first). */
function RahjAiPortalBody() {
  const { t } = useTranslations();
  const { openAssistant } = useRahjAiAssistant();

  return (
    <div className="advanced-module-manager pb-8">
      <div className="manager-header">
        <div className="header-main">
          <div className="title-section">
            <h1 className="page-title">
              <Sparkles className="title-icon h-8 w-8" aria-hidden />
              {t('rahj_ai.portal.title')}
            </h1>
            <p className="stat-item mt-2 max-w-2xl text-base leading-relaxed normal-case text-gray-600 dark:text-gray-300">
              {t('rahj_ai.portal.subtitle')}
            </p>
          </div>
          <div className="header-actions flex-wrap">
            <Link href="/erp-modules" className="btn btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.actions.back')}</span>
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => openAssistant()}>
              <MessageSquare className="h-4 w-4" />
              {t('rahj_ai.portal.open_drawer')}
            </button>
          </div>
        </div>
      </div>

      <div className="main-content mt-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <aside className="flex flex-col gap-4 lg:col-span-4">
            <div className="manager-header mb-0 py-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 dark:bg-blue-400/10">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden />
                </div>
                <div>
                  <h2 className="page-title mb-2 text-xl">{t('rahj_ai.portal.card_what_title')}</h2>
                  <p className="m-0 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {t('rahj_ai.portal.card_what_body')}
                  </p>
                </div>
              </div>
            </div>

            <div className="manager-header mb-0 py-5">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 dark:bg-emerald-400/10">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden />
                </div>
                <div>
                  <h2 className="page-title mb-2 text-xl">{t('rahj_ai.portal.card_privacy_title')}</h2>
                  <p className="m-0 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {t('rahj_ai.portal.card_privacy_body')}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col lg:col-span-8" aria-labelledby="rahj-ai-chat-heading">
            <div className="manager-header mb-3 shrink-0 py-4">
              <div className="header-main mb-0">
                <div className="title-section">
                  <h2 id="rahj-ai-chat-heading" className="page-title mb-1 text-xl">
                    <MessageSquare className="title-icon h-6 w-6 shrink-0" aria-hidden />
                    {t('rahj_ai.portal.chat_heading')}
                  </h2>
                  <p className="stat-item m-0 text-sm normal-case">{t('rahj_ai.portal.chat_subheading')}</p>
                </div>
              </div>
            </div>
            <RahjAiChatView variant="embedded" textareaId="rahj-ai-input-portal" />
          </section>
        </div>
      </div>
    </div>
  );
}

export default function RahjAiPortal() {
  const { t } = useTranslations();

  return (
    <AppLayout title={t('rahj_ai.portal.title')}>
      <RahjAiPortalBody />
    </AppLayout>
  );
}
