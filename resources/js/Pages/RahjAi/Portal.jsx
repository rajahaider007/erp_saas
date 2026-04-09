import React from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, ArrowLeft, Shield, BookOpen, MessageSquare, PlusCircle, Trash2, History } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import RahjAiChatView from '../../Components/RahjAi/RahjAiChatView';
import { useRahjAiAssistant } from '../../Contexts/RahjAiAssistantContext';
import { useTranslations } from '../../hooks/useTranslations';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function formatRelativeTime(isoDateTime) {
  if (!isoDateTime) {
    return '';
  }

  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const range of ranges) {
    if (Math.abs(seconds) >= range.seconds) {
      const value = Math.round(seconds / range.seconds);
      return relativeTimeFormatter.format(value, range.unit);
    }
  }

  return 'just now';
}

/** Must render inside AppLayout so RahjAiAssistantProvider is an ancestor (hooks run in parent first). */
function RahjAiPortalBody() {
  const { t } = useTranslations();
  const {
    openAssistant,
    startNewChat,
    clearConversation,
    clearAllConversations,
    loadConversation,
    conversationId,
    conversations,
    conversationsLoading,
    threadLoading,
  } = useRahjAiAssistant();

  return (
    <div className="advanced-module-manager rahj-ai-premium relative overflow-hidden pb-8">
      <div className="pointer-events-none absolute -left-24 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />

      <div className="manager-header rahj-ai-stagger relative overflow-hidden border border-white/20 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-blue-900/70 shadow-2xl shadow-blue-900/20 backdrop-blur-xl dark:border-blue-800/40" style={{ '--stagger-index': 0 }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" aria-hidden />
        <div className="header-main relative">
          <div className="title-section">
            <span className="mb-3 inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
              AI Assistant Portal
            </span>
            <h1 className="page-title text-white">
              <Sparkles className="title-icon h-8 w-8 text-cyan-300" aria-hidden />
              {t('rahj_ai.portal.title')}
            </h1>
            <p className="stat-item mt-2 max-w-2xl text-base leading-relaxed normal-case text-slate-200/90">
              {t('rahj_ai.portal.subtitle')}
            </p>
          </div>
          <div className="header-actions flex-wrap gap-2">
            <Link href="/erp-modules" className="btn btn-secondary border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('common.actions.back')}</span>
            </Link>
            <button
              type="button"
              className="btn border border-cyan-300/40 bg-cyan-400/20 text-cyan-50 shadow-lg shadow-cyan-900/30 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-cyan-400/30"
              onClick={() => openAssistant()}
            >
              <MessageSquare className="h-4 w-4" />
              {t('rahj_ai.portal.open_drawer')}
            </button>
          </div>
        </div>
      </div>

      <div className="main-content mt-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <section className="order-1 flex min-h-0 flex-col lg:order-2 lg:col-span-8" aria-labelledby="rahj-ai-chat-heading">
            <div className="manager-header rahj-ai-stagger mb-3 shrink-0 border border-white/15 bg-white/55 py-4 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-gray-700/60 dark:bg-slate-900/45" style={{ '--stagger-index': 2 }}>
              <div className="header-main mb-0">
                <div className="title-section">
                  <h2 id="rahj-ai-chat-heading" className="page-title mb-1 text-xl text-slate-900 dark:text-slate-100">
                    <MessageSquare className="title-icon h-6 w-6 shrink-0 text-cyan-600 dark:text-cyan-300" aria-hidden />
                    {t('rahj_ai.portal.chat_heading')}
                  </h2>
                  <p className="stat-item m-0 text-sm normal-case text-slate-600 dark:text-slate-300">{t('rahj_ai.portal.chat_subheading')}</p>
                </div>
                <div className="header-actions flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary border border-slate-300/70 bg-white/85 shadow-sm transition-all hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/80"
                    onClick={startNewChat}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>New Chat</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary border border-amber-300/70 bg-amber-50/90 text-amber-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-100 dark:border-amber-600/60 dark:bg-amber-900/25 dark:text-amber-300"
                    onClick={clearConversation}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Chat</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary border border-rose-300/70 bg-rose-50/90 text-rose-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-600/60 dark:bg-rose-900/25 dark:text-rose-300"
                    onClick={clearAllConversations}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear All Chats</span>
                  </button>
                </div>
              </div>
            </div>
            {threadLoading ? (
              <div className="manager-header flex min-h-[320px] items-center justify-center border border-white/20 bg-white/60 py-8 text-sm text-gray-600 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-slate-900/45 dark:text-gray-400">
                Loading chat...
              </div>
            ) : (
              <RahjAiChatView variant="embedded" textareaId="rahj-ai-input-portal" />
            )}
          </section>

          <aside className="order-2 flex min-h-0 flex-col lg:order-1 lg:col-span-4">
            <div className="manager-header rahj-ai-stagger mb-0 flex min-h-[320px] flex-col border border-white/20 bg-gradient-to-b from-white/80 to-slate-100/50 py-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl dark:border-gray-700/60 dark:from-slate-900/70 dark:to-slate-900/40" style={{ '--stagger-index': 1 }}>
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-700/70">
                <h2 className="page-title mb-0 text-lg text-slate-900 dark:text-slate-100">
                  <History className="title-icon h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden />
                  Chat History
                </h2>
                <span className="rounded-full border border-cyan-300/40 bg-cyan-100/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-600/50 dark:bg-cyan-900/40 dark:text-cyan-200">
                  {conversations.length} Threads
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm border border-slate-300/70 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/70"
                  onClick={startNewChat}
                >
                  New
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {conversationsLoading ? (
                  <div className="rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-xs text-gray-600 dark:border-gray-700/50 dark:bg-gray-900/50 dark:text-gray-300">
                    Loading history...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-cyan-300/40 bg-cyan-50/70 px-3 py-2 text-xs text-cyan-800 dark:border-cyan-700/50 dark:bg-cyan-950/30 dark:text-cyan-200">
                    No previous chats yet.
                  </div>
                ) : (
                  conversations.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => loadConversation(item.id)}
                      className={`rahj-ai-history-item w-full rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                        Number(conversationId) === Number(item.id)
                          ? 'border-cyan-500/60 bg-cyan-500/10 shadow-md shadow-cyan-900/10'
                          : 'border-white/30 bg-white/60 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-900/40 dark:hover:bg-gray-800/60'
                      }`}
                      style={{ '--stagger-index': index + 3 }}
                    >
                      <div className="truncate text-xs font-semibold text-gray-800 dark:text-gray-100">{item.title || `Chat #${item.id}`}</div>
                      <div className="mt-1 truncate text-[11px] text-gray-600 dark:text-gray-400">{item.preview || 'No preview'}</div>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {formatRelativeTime(item.updated_at) || 'just now'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          <section className="grid grid-cols-1 gap-4 lg:col-span-12 md:grid-cols-2">
            <div className="manager-header rahj-ai-stagger mb-0 border border-white/20 bg-gradient-to-br from-white/85 to-blue-50/50 py-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-gray-700/60 dark:from-slate-900/70 dark:to-blue-950/20" style={{ '--stagger-index': 3 }}>
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

            <div className="manager-header rahj-ai-stagger mb-0 border border-white/20 bg-gradient-to-br from-white/85 to-emerald-50/50 py-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-gray-700/60 dark:from-slate-900/70 dark:to-emerald-950/20" style={{ '--stagger-index': 4 }}>
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
