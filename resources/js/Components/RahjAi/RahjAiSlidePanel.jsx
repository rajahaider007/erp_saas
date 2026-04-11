import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, X, MessageSquare, PlusCircle, PanelLeft } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useLayout } from '../../Contexts/LayoutContext';
import { useRahjAiAssistant } from '../../Contexts/RahjAiAssistantContext';
import { useTranslations } from '../../hooks/useTranslations';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import RahjAiChatView from './RahjAiChatView';

/**
 * Right-edge slide panel + floating bubble. Chat body is shared with portal via context.
 */
export default function RahjAiSlidePanel({ open, onOpenChange }) {
  const { t } = useTranslations();
  const { url } = usePage();
  const { animationsEnabled } = useLayout();
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const [listOpen, setListOpen] = useState(true);

  const {
    startNewChat,
    loadConversation,
    conversationId,
    conversations,
    conversationsLoading,
    threadLoading,
  } = useRahjAiAssistant();

  const transitionClass = animationsEnabled ? 'duration-300 ease-out' : 'duration-0';
  const isPortalPage = typeof url === 'string' && url.split('?')[0].replace(/\/$/, '') === '/rahj-ai';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] transition-opacity ${transitionClass} ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
        onClick={() => onOpenChange(false)}
      />

      <aside
        id="rahj-ai-slide-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rahj-ai-panel-title"
        className={`fixed top-0 right-0 z-[100] flex h-full w-full max-w-[min(100vw,30rem)] flex-col border-l border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform dark:border-gray-700/50 dark:bg-gray-900/95 ${transitionClass} ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="manager-header shrink-0 rounded-none border-b border-white/20 dark:border-gray-700/50">
          <div className="header-main mb-0">
            <div className="title-section">
              <h2 id="rahj-ai-panel-title" className="page-title mb-1">
                <Sparkles className="title-icon h-7 w-7 shrink-0" aria-hidden />
                {t('rahj_ai.portal.panel_title')}
              </h2>
              <p className="stat-item m-0 text-sm normal-case">
                {t('rahj_ai.portal.panel_subtitle')}
              </p>
            </div>
            <div className="header-actions flex items-center gap-1.5">
              <button
                type="button"
                className="btn btn-icon btn-secondary"
                onClick={() => setListOpen((v) => !v)}
                aria-expanded={listOpen}
                aria-label={t('rahj_ai.portal.drawer_toggle_list')}
                title={t('rahj_ai.portal.drawer_toggle_list')}
              >
                <PanelLeft className={`h-5 w-5 transition-transform ${listOpen ? '' : 'opacity-70'}`} />
              </button>
              <button
                type="button"
                ref={firstFocusableRef}
                className="btn btn-icon btn-secondary"
                onClick={() => onOpenChange(false)}
                aria-label={t('rahj_ai.portal.close_panel')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-row">
          {listOpen ? (
            <nav
              className="flex w-[11rem] shrink-0 flex-col border-r border-slate-200/80 bg-gradient-to-b from-slate-50/95 to-slate-100/90 dark:border-gray-700/60 dark:from-slate-950/95 dark:to-slate-900/90"
              aria-label={t('rahj_ai.portal.drawer_chats_heading')}
            >
              <div className="shrink-0 space-y-2 border-b border-slate-200/70 p-2.5 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={startNewChat}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-2 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-900/20 transition-all hover:from-cyan-400 hover:to-blue-500 dark:border-cyan-500/40"
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t('rahj_ai.portal.drawer_new_chat')}
                </button>
                <div className="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-3 w-3" aria-hidden />
                  {t('rahj_ai.portal.drawer_chats_heading')}
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                {conversationsLoading ? (
                  <div className="rounded-lg border border-slate-200/80 bg-white/70 px-2 py-2 text-[11px] text-slate-600 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                    {t('rahj_ai.portal.drawer_loading_chats')}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-cyan-300/50 bg-cyan-50/80 px-2 py-2 text-[11px] leading-snug text-cyan-900 dark:border-cyan-700/50 dark:bg-cyan-950/40 dark:text-cyan-100">
                    {t('rahj_ai.portal.drawer_no_chats')}
                  </div>
                ) : (
                  conversations.map((item) => {
                    const isActive = Number(conversationId) === Number(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => loadConversation(item.id)}
                        className={`w-full rounded-lg border px-2 py-2 text-left text-[11px] transition-all ${
                          isActive
                            ? 'border-cyan-500/60 bg-cyan-500/15 shadow-sm dark:border-cyan-500/50 dark:bg-cyan-500/10'
                            : 'border-transparent bg-white/60 hover:border-slate-200/90 hover:bg-white dark:bg-slate-800/40 dark:hover:border-slate-600 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="line-clamp-2 font-semibold leading-tight text-slate-900 dark:text-slate-100">
                          {item.title || `Chat #${item.id}`}
                        </div>
                        <div className="mt-1 truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {formatRelativeTime(item.updated_at) || '—'}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </nav>
          ) : null}

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {threadLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 px-4 text-center backdrop-blur-sm dark:bg-slate-900/85">
                <div className="max-w-[14rem] rounded-2xl border border-cyan-300/50 bg-cyan-50/90 px-4 py-5 text-sm text-slate-700 shadow-sm dark:border-cyan-700/50 dark:bg-slate-800/90 dark:text-slate-200">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-cyan-600 dark:text-cyan-300" aria-hidden />
                  <div className="font-semibold text-slate-900 dark:text-white">{t('rahj_ai.portal.drawer_loading_thread')}</div>
                </div>
              </div>
            ) : null}
            {!listOpen ? (
              <div className="shrink-0 border-b border-slate-200/70 px-3 py-2 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={startNewChat}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-900/20 transition-all hover:from-cyan-400 hover:to-blue-500"
                >
                  <PlusCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t('rahj_ai.portal.drawer_new_chat')}
                </button>
              </div>
            ) : null}
            <RahjAiChatView variant="drawer" textareaId="rahj-ai-input-drawer" className="min-h-0 flex-1" />
          </div>
        </div>
      </aside>

      {!isPortalPage && (
        <button
          type="button"
          className={`fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/35 ring-2 ring-white/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50 dark:ring-gray-800/50 ${transitionClass} ${
            open ? 'pointer-events-none scale-90 opacity-0' : 'opacity-100'
          }`}
          onClick={() => onOpenChange(true)}
          aria-expanded={open}
          aria-controls="rahj-ai-slide-panel"
          aria-label={t('rahj_ai.portal.bubble_aria')}
        >
          <Sparkles className="h-7 w-7" aria-hidden />
        </button>
      )}
    </>
  );
}
