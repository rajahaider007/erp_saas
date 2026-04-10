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

  const currentConversation = conversations.find((item) => Number(item.id) === Number(conversationId));
  const portalStats = [
    {
      label: 'Threads',
      value: conversations.length,
      detail: conversationsLoading ? 'Refreshing saved chats' : 'Saved conversations',
      icon: History,
    },
    {
      label: 'Active state',
      value: threadLoading ? 'Loading' : 'Ready',
      detail: currentConversation ? currentConversation.title || `Chat #${currentConversation.id}` : 'Start a fresh thread',
      icon: MessageSquare,
    },
    {
      label: 'Assistant mode',
      value: 'Embedded',
      detail: 'Chat, history, and actions in one workspace',
      icon: Sparkles,
    },
  ];

  const guidanceItems = [
    {
      title: 'Ask for ERP work',
      body: 'Use it for reports, filters, summaries, and workflow guidance across the app.',
      icon: BookOpen,
    },
    {
      title: 'Keep it private',
      body: 'The assistant is presented as a session workspace, not a public chat feed.',
      icon: Shield,
    },
    {
      title: 'Start clean when needed',
      body: 'Use New Chat or Clear Chat when you want a different context.',
      icon: PlusCircle,
    },
  ];

  return (
    <div className="relative isolate overflow-hidden pb-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(241,245,249,0.82))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))]" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[-4rem] top-32 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />

      <div className="rahj-ai-stagger relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 px-6 py-7 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/90 sm:px-8" style={{ '--stagger-index': 0 }}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15 dark:opacity-25" aria-hidden />
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute bottom-[-5rem] left-[-3rem] h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-300/30 dark:bg-cyan-400/10 dark:text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Rahj AI Portal
              </span>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                  {t('rahj_ai.portal.title')}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-200/90 sm:text-base">
                  {t('rahj_ai.portal.subtitle')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-200/90">
                <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-white/10">
                  Session aware
                </span>
                <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-white/10">
                  Draft-friendly
                </span>
                <span className="rounded-full border border-slate-300/70 bg-white/70 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-white/10">
                  ERP-focused
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/erp-modules" className="btn btn-secondary border border-slate-300/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-lg dark:shadow-black/10 dark:hover:bg-white/15">
                <ArrowLeft className="h-4 w-4" />
                <span>{t('common.actions.back')}</span>
              </Link>
              <button
                type="button"
                className="btn border border-cyan-400/60 bg-cyan-500/15 text-cyan-700 shadow-sm shadow-cyan-900/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-cyan-500/25 dark:border-cyan-300/40 dark:bg-cyan-400/20 dark:text-cyan-50 dark:shadow-lg dark:shadow-cyan-900/30 dark:hover:bg-cyan-400/30"
                onClick={() => openAssistant()}
              >
                <MessageSquare className="h-4 w-4" />
                {t('rahj_ai.portal.open_drawer')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {portalStats.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rahj-ai-stagger rounded-2xl border border-slate-200/80 bg-white/75 p-4 text-slate-900 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-lg dark:shadow-black/10"
                  style={{ '--stagger-index': index + 1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300/80">{item.label}</div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{item.value}</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300/85">{item.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="order-1 flex min-h-0 flex-col xl:col-span-8" aria-labelledby="rahj-ai-chat-heading">
          <div className="rahj-ai-stagger overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/70" style={{ '--stagger-index': 4 }}>
            <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-cyan-50/80 px-5 py-4 dark:border-slate-700/60 dark:from-slate-900/80 dark:to-slate-900/60 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                    Live Conversation
                  </div>
                  <h2 id="rahj-ai-chat-heading" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {t('rahj_ai.portal.chat_heading')}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {t('rahj_ai.portal.chat_subheading')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary border border-slate-300/70 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/80"
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
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            </div>

            {threadLoading ? (
              <div className="flex min-h-[540px] items-center justify-center px-6 py-10 text-center">
                <div className="max-w-sm rounded-[1.5rem] border border-dashed border-cyan-300/60 bg-cyan-50/70 px-6 py-8 text-sm text-slate-600 shadow-sm dark:border-cyan-700/50 dark:bg-cyan-950/25 dark:text-slate-300">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    <Sparkles className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Loading chat...</div>
                  <p className="mt-2 leading-6">
                    Preparing the current conversation and restoring the latest context.
                  </p>
                </div>
              </div>
            ) : (
              <RahjAiChatView variant="embedded" textareaId="rahj-ai-input-portal" className="rounded-none border-0 shadow-none" />
            )}
          </div>
        </section>

        <aside className="order-2 space-y-5 xl:col-span-4">
          <div className="rahj-ai-stagger overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/70" style={{ '--stagger-index': 5 }}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/60 sm:px-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <History className="h-5 w-5 text-cyan-600 dark:text-cyan-300" aria-hidden />
                  Chat History
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Pick up where you left off or start a new branch.</p>
              </div>
              <span className="rounded-full border border-cyan-300/40 bg-cyan-100/80 px-3 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-600/50 dark:bg-cyan-900/40 dark:text-cyan-200">
                {conversations.length} Threads
              </span>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300/70 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={startNewChat}
              >
                <PlusCircle className="h-4 w-4" />
                New Chat
              </button>

              <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
                {conversationsLoading ? (
                  <div className="rounded-2xl border border-white/20 bg-white/70 px-3 py-3 text-sm text-gray-600 dark:border-gray-700/50 dark:bg-gray-900/50 dark:text-gray-300">
                    Loading history...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-cyan-300/40 bg-cyan-50/70 px-3 py-3 text-sm text-cyan-800 dark:border-cyan-700/50 dark:bg-cyan-950/30 dark:text-cyan-200">
                    No previous chats yet.
                  </div>
                ) : (
                  conversations.map((item, index) => {
                    const isActive = Number(conversationId) === Number(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => loadConversation(item.id)}
                        className={`rahj-ai-history-item w-full rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${
                          isActive
                            ? 'border-cyan-500/60 bg-cyan-500/10 shadow-md shadow-cyan-900/10'
                            : 'border-slate-200/80 bg-white/70 hover:-translate-y-0.5 hover:bg-white hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/45 dark:hover:bg-slate-900/70'
                        }`}
                        style={{ '--stagger-index': index + 6 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title || `Chat #${item.id}`}</div>
                            <div className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400">{item.preview || 'No preview'}</div>
                          </div>
                          <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`} aria-hidden />
                        </div>
                        <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {formatRelativeTime(item.updated_at) || 'just now'}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="rahj-ai-stagger overflow-hidden rounded-[1.75rem] border border-white/60 bg-gradient-to-br from-white/90 to-cyan-50/60 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700/60 dark:from-slate-950/80 dark:to-cyan-950/20" style={{ '--stagger-index': 6 }}>
            <div className="border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/60 sm:px-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
                What this assistant does
              </h3>
            </div>

            <div className="space-y-3 px-5 py-4 sm:px-6">
              {guidanceItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-3 rounded-2xl border border-white/60 bg-white/75 p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200/80 px-5 py-4 dark:border-slate-700/60 sm:px-6">
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/25 dark:text-emerald-200">
                <div className="font-semibold">Privacy first</div>
                <p className="mt-1 leading-6">
                  Your assistant tools stay in the ERP workspace and are designed for internal use.
                </p>
              </div>
            </div>
          </div>
        </aside>
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
