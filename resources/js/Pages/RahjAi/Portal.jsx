import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles, ArrowLeft, MessageSquare, PlusCircle, Trash2, History, Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import RahjAiChatView from '../../Components/RahjAi/RahjAiChatView';
import { useRahjAiAssistant } from '../../Contexts/RahjAiAssistantContext';
import { useTranslations } from '../../hooks/useTranslations';
import { formatRelativeTime } from '../../utils/formatRelativeTime';

/** Must render inside AppLayout so RahjAiAssistantProvider is an ancestor (hooks run in parent first). */
function RahjAiPortalBody() {
  const { t } = useTranslations();
  /** 'assistant' = AI chat in the card; 'list' = same card shows saved chats (no drawer). */
  const [mainView, setMainView] = useState('assistant');
  const [listSearch, setListSearch] = useState('');

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

  const handleSelectConversation = (id) => {
    loadConversation(id);
    setMainView('assistant');
  };

  const handleNewChatFromList = () => {
    startNewChat();
    setMainView('assistant');
  };

  useEffect(() => {
    if (mainView !== 'list') {
      setListSearch('');
    }
  }, [mainView]);

  const filteredConversations = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const title = String(c.title || '').toLowerCase();
      const preview = String(c.preview || '').toLowerCase();
      return title.includes(q) || preview.includes(q);
    });
  }, [conversations, listSearch]);

  const currentConversation = conversations.find((item) => Number(item.id) === Number(conversationId));
  const activeThreadLabel = currentConversation
    ? currentConversation.title || `Chat #${currentConversation.id}`
    : null;

  return (
    <div className="relative isolate overflow-hidden pb-4">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(241,245,249,0.82))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))]" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-[-4rem] top-32 -z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />

      <div
        className="rahj-ai-stagger relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/90 sm:px-4"
        style={{ '--stagger-index': 0 }}
      >
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                {t('rahj_ai.portal.title')}
              </h1>
              <p className="line-clamp-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400 sm:text-xs">
                {t('rahj_ai.portal.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
            <Link
              href="/erp-modules"
              className="btn btn-secondary btn-sm border border-slate-300/70 bg-white/90 px-2.5 py-1.5 text-xs text-slate-700 dark:border-white/15 dark:bg-white/10 dark:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t('common.actions.back')}</span>
            </Link>
            <button
              type="button"
              className="btn btn-sm border border-cyan-400/50 bg-cyan-500/15 px-2.5 py-1.5 text-xs text-cyan-800 dark:border-cyan-300/40 dark:bg-cyan-400/15 dark:text-cyan-50"
              onClick={() => openAssistant()}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {t('rahj_ai.portal.open_drawer')}
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-slate-200/70 pt-2 text-[10px] text-slate-500 dark:border-slate-700/50 dark:text-slate-400 sm:text-[11px]">
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
            <History className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
            {conversationsLoading ? '…' : conversations.length}{' '}
            <span className="font-normal opacity-90">{t('rahj_ai.portal.compact_saved')}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <MessageSquare className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
            {threadLoading ? t('rahj_ai.portal.compact_loading') : t('rahj_ai.portal.compact_ready')}
          </span>
          {activeThreadLabel ? (
            <>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden>
                ·
              </span>
              <span className="max-w-[min(100%,14rem)] truncate font-medium text-slate-700 dark:text-slate-200 sm:max-w-[20rem]" title={activeThreadLabel}>
                {activeThreadLabel}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <section className="order-1 flex min-h-0 flex-col" aria-labelledby={mainView === 'list' ? 'rahj-ai-list-heading' : 'rahj-ai-chat-heading'}>
          <div className="rahj-ai-stagger overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-[0_16px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/70" style={{ '--stagger-index': 4 }}>
            <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-cyan-50/80 px-4 py-3 dark:border-slate-700/60 dark:from-slate-900/80 dark:to-slate-900/60 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                  {mainView === 'list' ? (
                    <>
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">
                        <History className="h-3 w-3" aria-hidden />
                        {t('rahj_ai.portal.drawer_chats_heading')}
                      </div>
                      <h2 id="rahj-ai-list-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                        {t('rahj_ai.portal.chat_list_heading')}
                      </h2>
                      <p className="max-w-2xl text-xs leading-snug text-slate-600 dark:text-slate-300 sm:text-sm">
                        {t('rahj_ai.portal.chat_list_subheading')}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">
                        <MessageSquare className="h-3 w-3" aria-hidden />
                        Live Conversation
                      </div>
                      <h2 id="rahj-ai-chat-heading" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                        {t('rahj_ai.portal.chat_heading')}
                      </h2>
                      <p className="max-w-2xl text-xs leading-snug text-slate-600 dark:text-slate-300 sm:text-sm">
                        {t('rahj_ai.portal.chat_subheading')}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {mainView === 'list' ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary border border-slate-300/70 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/80"
                        onClick={() => setMainView('assistant')}
                        aria-label={t('rahj_ai.portal.back_to_chat_aria')}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{t('rahj_ai.portal.back_to_chat')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn border border-cyan-400/50 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-3 text-white shadow-md shadow-cyan-900/20 transition-all hover:from-cyan-400 hover:to-blue-500"
                        onClick={handleNewChatFromList}
                      >
                        <PlusCircle className="h-4 w-4" aria-hidden />
                        <span>{t('rahj_ai.portal.drawer_new_chat')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn border border-cyan-400/60 bg-cyan-500/15 text-cyan-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-cyan-500/25 dark:border-cyan-300/40 dark:bg-cyan-400/15 dark:text-cyan-50"
                        onClick={() => setMainView('list')}
                        aria-label={t('rahj_ai.portal.all_chats_aria')}
                      >
                        <History className="h-4 w-4" aria-hidden />
                        <span>{t('rahj_ai.portal.all_chats')}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary border border-slate-300/70 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/80"
                        onClick={startNewChat}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>{t('rahj_ai.portal.drawer_new_chat')}</span>
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
                    </>
                  )}
                </div>
              </div>
            </div>

            {mainView === 'list' ? (
              <div className="flex min-h-[min(72vh,720px)] flex-col">
                <div className="shrink-0 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/50 sm:px-6">
                  <label htmlFor="rahj-ai-chat-search" className="sr-only">
                    {t('rahj_ai.portal.chat_search_placeholder')}
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden />
                    <input
                      id="rahj-ai-chat-search"
                      type="search"
                      value={listSearch}
                      onChange={(e) => setListSearch(e.target.value)}
                      placeholder={t('rahj_ai.portal.chat_search_placeholder')}
                      className="w-full rounded-xl border border-cyan-500/30 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-inner outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-500/60 dark:border-cyan-700/40 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 sm:px-6">
                  {conversationsLoading ? (
                    <div className="rounded-2xl border border-white/20 bg-white/70 px-3 py-3 text-sm text-slate-600 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-slate-300">
                      {t('rahj_ai.portal.drawer_loading_chats')}
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-cyan-300/40 bg-cyan-50/70 px-3 py-3 text-sm text-cyan-800 dark:border-cyan-700/50 dark:bg-cyan-950/30 dark:text-cyan-200">
                      {t('rahj_ai.portal.drawer_no_chats')}
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300">
                      {t('rahj_ai.portal.chat_search_no_results')}
                    </div>
                  ) : (
                    <ul className="m-0 list-none space-y-1.5 border-t border-slate-200/40 p-0 pt-2 dark:border-slate-700/40">
                      {filteredConversations.map((item, index) => {
                        const isActive = Number(conversationId) === Number(item.id);

                        return (
                          <li key={item.id} className="border-b border-slate-200/60 pb-2 last:border-b-0 dark:border-slate-700/50">
                            <button
                              type="button"
                              onClick={() => handleSelectConversation(item.id)}
                              className={`rahj-ai-history-item w-full rounded-lg px-2 py-2.5 text-left transition-colors duration-150 ${
                                isActive ? 'bg-cyan-500/10 dark:bg-cyan-500/10' : 'hover:bg-slate-50/90 dark:hover:bg-slate-800/50'
                              }`}
                              style={{ '--stagger-index': index + 6 }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {item.title || `Chat #${item.id}`}
                                  </div>
                                  <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    {t('rahj_ai.portal.chat_list_last_message')}{' '}
                                    {formatRelativeTime(item.updated_at) || '—'}
                                  </div>
                                </div>
                                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-cyan-500' : 'bg-transparent'}`} aria-hidden />
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ) : threadLoading ? (
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
