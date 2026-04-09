import React, { useEffect, useRef } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useRahjAiAssistant } from '../../Contexts/RahjAiAssistantContext';
import { useTranslations } from '../../hooks/useTranslations';

/**
 * Shared chat thread + composer (form-themes input). Used on portal (embedded) and in slide drawer.
 */
export default function RahjAiChatView({ variant = 'drawer', textareaId = 'rahj-ai-input', className = '' }) {
  const { t } = useTranslations();
  const { messages, draft, setDraft, sendMessage } = useRahjAiAssistant();
  const listRef = useRef(null);
  const embedded = variant === 'embedded';

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => sendMessage();

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    t('rahj_ai.portal.suggestion_reports'),
    t('rahj_ai.portal.suggestion_navigation'),
    t('rahj_ai.portal.suggestion_capabilities'),
  ];

  return (
    <div
      className={`${
        embedded
          ? 'flex min-h-[min(62vh,600px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/40 shadow-inner dark:border-gray-600/40 dark:bg-gray-800/40'
          : 'flex min-h-0 flex-1 flex-col'
      } ${className}`.trim()}
    >
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-2 py-6 text-center">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 p-4 dark:from-blue-400/10 dark:to-indigo-500/10">
              <Sparkles className="mx-auto h-10 w-10 text-blue-500 dark:text-blue-400" aria-hidden />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {t('rahj_ai.portal.empty_title')}
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('rahj_ai.portal.empty_hint')}
            </p>
            <div className="mt-2 flex max-w-lg flex-wrap justify-center gap-2">
              {suggestions.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-200 dark:hover:bg-blue-500/15"
                  onClick={() => sendMessage(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="mt-1 inline-flex items-center rounded-full border border-dashed border-blue-300/80 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-300">
              {t('rahj_ai.portal.coming_soon')}
            </span>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                    : 'border border-gray-200/80 bg-white/90 text-gray-800 dark:border-gray-600/60 dark:bg-gray-800/90 dark:text-gray-100'
                }`}
              >
                {msg.role === 'assistant' && msg.pending ? (
                  <span className="text-gray-500 italic dark:text-gray-400">
                    {t('rahj_ai.portal.reply_pending')}
                  </span>
                ) : (
                  <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className={`shrink-0 border-t border-gray-200/80 bg-white/90 p-3 dark:border-gray-700/60 dark:bg-gray-900/90 ${
          embedded ? 'rounded-b-2xl' : ''
        }`}
      >
        <label className="sr-only" htmlFor={textareaId}>
          {t('rahj_ai.portal.input_placeholder')}
        </label>
        <div className="flex gap-2">
          <div className="search-input-wrapper min-w-0 flex-1 rounded-xl border border-gray-200/90 bg-white dark:border-gray-600 dark:bg-gray-800/80">
            <textarea
              id={textareaId}
              rows={embedded ? 3 : 2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="search-input min-h-[2.75rem] resize-none border-0 bg-transparent py-2.5 focus:ring-0"
              placeholder={t('rahj_ai.portal.input_placeholder')}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="btn btn-primary btn-icon h-[2.75rem] w-[2.75rem] shrink-0 self-end disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t('rahj_ai.portal.send')}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-500">
          {t('rahj_ai.portal.composer_hint')}
        </p>
      </div>
    </div>
  );
}
