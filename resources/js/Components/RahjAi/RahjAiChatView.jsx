import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useRahjAiAssistant } from '../../Contexts/RahjAiAssistantContext';
import { useTranslations } from '../../hooks/useTranslations';
import { stashRahjAiDraftAction } from '../../utils/rahjAiDraft';

const markdownLinkPattern = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g;
const plainLinkPattern = /(https?:\/\/[^\s<>()]+|\/[a-zA-Z0-9\-._~\/?#=&%]+)/g;

function isInternalLink(href) {
  return typeof href === 'string' && href.startsWith('/');
}

function normalizeLinkMatch(raw) {
  if (!raw) {
    return { href: '', trailing: '' };
  }

  let href = raw;
  let trailing = '';
  while (/[),.;!?]$/.test(href)) {
    trailing = href.slice(-1) + trailing;
    href = href.slice(0, -1);
  }

  return { href, trailing };
}

function LinkText({ href, children }) {
  const internal = isInternalLink(href);

  return (
    <a
      href={href}
      target={internal ? '_self' : '_blank'}
      rel={internal ? undefined : 'noreferrer noopener'}
      className="break-all font-medium underline decoration-blue-400/70 underline-offset-2 transition-colors hover:text-blue-600 dark:hover:text-blue-300"
    >
      {children}
    </a>
  );
}

function renderPlainLinks(text, keyPrefix) {
  const source = String(text || '');
  const result = [];
  let cursor = 0;
  let linkIndex = 0;

  plainLinkPattern.lastIndex = 0;
  let match;
  while ((match = plainLinkPattern.exec(source)) !== null) {
    const start = match.index;
    const rawMatch = match[0];
    const before = source.slice(cursor, start);
    if (before) {
      result.push(<React.Fragment key={`${keyPrefix}-txt-${cursor}`}>{before}</React.Fragment>);
    }

    const normalized = normalizeLinkMatch(rawMatch);
    if (normalized.href) {
      result.push(
        <LinkText href={normalized.href} key={`${keyPrefix}-lnk-${linkIndex}`}>
          {normalized.href}
        </LinkText>,
      );
      linkIndex += 1;
    }

    if (normalized.trailing) {
      result.push(<React.Fragment key={`${keyPrefix}-trail-${linkIndex}`}>{normalized.trailing}</React.Fragment>);
    }

    cursor = start + rawMatch.length;
  }

  const remaining = source.slice(cursor);
  if (remaining) {
    result.push(<React.Fragment key={`${keyPrefix}-rest`}>{remaining}</React.Fragment>);
  }

  return result.length ? result : [source];
}

function renderMarkdownAndPlainLinks(text, lineIndex) {
  const source = String(text || '');
  const result = [];
  let cursor = 0;
  let matchIndex = 0;

  markdownLinkPattern.lastIndex = 0;
  let match;
  while ((match = markdownLinkPattern.exec(source)) !== null) {
    const start = match.index;
    const [full, label, hrefRaw] = match;
    const before = source.slice(cursor, start);

    if (before) {
      result.push(...renderPlainLinks(before, `line-${lineIndex}-before-${matchIndex}`));
    }

    const normalized = normalizeLinkMatch(hrefRaw);
    const href = normalized.href || hrefRaw;
    result.push(
      <LinkText href={href} key={`line-${lineIndex}-md-${matchIndex}`}>
        {label}
      </LinkText>,
    );
    if (normalized.trailing) {
      result.push(<React.Fragment key={`line-${lineIndex}-mdtrail-${matchIndex}`}>{normalized.trailing}</React.Fragment>);
    }

    cursor = start + full.length;
    matchIndex += 1;
  }

  const remaining = source.slice(cursor);
  if (remaining) {
    result.push(...renderPlainLinks(remaining, `line-${lineIndex}-rest`));
  }

  return result.length ? result : [source];
}

function RichMessageText({ content }) {
  const lines = String(content || '').split('\n');

  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={`line-${i}`}>
          {renderMarkdownAndPlainLinks(line, i)}
          {i < lines.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </>
  );
}

function ActionCard({ action }) {
  const isDraftAction = Boolean(action && action.type === 'draft_prefill' && action.route);

  const targetLabelMap = {
    purchase_requisition: 'Purchase Requisition',
    purchase_order: 'Purchase Order',
    goods_receipt_note: 'Goods Receipt Note',
    journal_voucher: 'Journal Voucher',
    bank_voucher: 'Bank Voucher',
    cash_voucher: 'Cash Voucher',
    opening_voucher: 'Opening Voucher',
  };

  const targetLabel = targetLabelMap[action.target] || action.target || 'Draft Form';

  const payloadEntries = useMemo(() => {
    const payload = action && action.payload && typeof action.payload === 'object' ? action.payload : {};
    return Object.entries(payload);
  }, [action]);

  const [selectedFields, setSelectedFields] = useState(() => payloadEntries.map(([key]) => key));

  const allSelected = payloadEntries.length > 0 && selectedFields.length === payloadEntries.length;

  const toggleField = (fieldKey) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldKey)) {
        return prev.filter((item) => item !== fieldKey);
      }
      return [...prev, fieldKey];
    });
  };

  const toggleAllFields = () => {
    setSelectedFields((prev) => {
      if (payloadEntries.length > 0 && prev.length === payloadEntries.length) {
        return [];
      }
      return payloadEntries.map(([key]) => key);
    });
  };

  const selectedPayload = useMemo(() => {
    const payload = action && action.payload && typeof action.payload === 'object' ? action.payload : {};
    const next = {};
    for (const key of selectedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        next[key] = payload[key];
      }
    }
    return next;
  }, [action, selectedFields]);

  const applyDraft = () => {
    if (!isDraftAction) {
      return;
    }

    stashRahjAiDraftAction({
      ...action,
      payload: selectedPayload,
    });
    router.visit(action.route);
  };

  if (!isDraftAction) {
    return null;
  }

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'empty';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[object]';
      }
    }
    return String(value);
  };

  return (
    <div className="mt-3 rounded-xl border border-emerald-300/70 bg-emerald-50/90 p-3 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200">
      <div className="mb-1 text-sm font-semibold">Draft Action Ready</div>
      <div className="mb-2">Target: {targetLabel}</div>
      {payloadEntries.length > 0 && (
        <div className="mb-3 rounded-lg border border-emerald-300/60 bg-white/60 p-2 dark:border-emerald-800/50 dark:bg-emerald-950/20">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-90">Draft Fields</div>
            <button
              type="button"
              onClick={toggleAllFields}
              className="rounded border border-emerald-500/50 px-2 py-0.5 text-[11px] font-semibold transition-colors hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40"
            >
              {allSelected ? 'Unselect All' : 'Select All'}
            </button>
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {payloadEntries.map(([field, value]) => {
              const checked = selectedFields.includes(field);
              return (
                <label
                  key={field}
                  className="flex cursor-pointer items-start gap-2 rounded border border-emerald-200/60 px-2 py-1 transition-colors hover:bg-emerald-100/40 dark:border-emerald-800/40 dark:hover:bg-emerald-900/20"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleField(field)}
                    className="mt-0.5"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{field}</span>
                    <span className="block truncate opacity-80">{formatValue(value)}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={applyDraft}
        disabled={payloadEntries.length > 0 && selectedFields.length === 0}
        className="rounded-lg border border-emerald-500/60 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Apply Selected Fields And Open Form
      </button>
      <div className="mt-2 text-[11px] opacity-80">Review required before saving.</div>
    </div>
  );
}

/**
 * Shared chat thread + composer (form-themes input). Used on portal (embedded) and in slide drawer.
 */
export default function RahjAiChatView({ variant = 'drawer', textareaId = 'rahj-ai-input', className = '' }) {
  const { t } = useTranslations();
  const { messages, draft, setDraft, sendMessage } = useRahjAiAssistant();
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const embedded = variant === 'embedded';

  const syncComposerHeight = () => {
    const el = textareaRef.current;
    if (!el || typeof window === 'undefined') return;
    el.style.height = '0px';
    const minPx = 44;
    const maxPx = Math.min(Math.round(window.innerHeight * 0.5), 480);
    const next = Math.max(el.scrollHeight, minPx);
    const clamped = Math.min(next, maxPx);
    el.style.height = `${clamped}px`;
    el.style.overflowY = next > maxPx ? 'auto' : 'hidden';
  };

  useLayoutEffect(() => {
    syncComposerHeight();
  }, [draft]);

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
          ? 'relative flex min-h-[min(66vh,680px)] flex-col overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-b from-white/75 via-white/55 to-slate-100/40 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-gray-700/60 dark:from-slate-900/75 dark:via-slate-900/60 dark:to-slate-950/55'
          : 'flex min-h-0 flex-1 flex-col'
      } ${className}`.trim()}
    >
      {embedded && <div className="pointer-events-none absolute -right-14 -top-12 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" aria-hidden />}
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-transparent via-transparent to-white/15 px-4 py-4 dark:to-slate-950/15"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-2 py-6 text-center">
            <div className="relative rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 p-4 shadow-lg shadow-cyan-900/10 dark:border-cyan-700/40 dark:from-cyan-400/10 dark:to-blue-600/10">
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-500/70 animate-ping" aria-hidden />
              <Sparkles className="mx-auto h-10 w-10 text-cyan-600 dark:text-cyan-300" aria-hidden />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              {t('rahj_ai.portal.empty_title')}
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t('rahj_ai.portal.empty_hint')}
            </p>
            <div className="mt-2 flex max-w-lg flex-wrap justify-center gap-2">
              {suggestions.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                  onClick={() => sendMessage(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`rahj-ai-chat-entry flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ '--stagger-index': index + 1 }}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                  msg.role === 'user'
                    ? 'border border-cyan-400/30 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/25'
                    : msg.error
                      ? 'border border-rose-200/90 bg-rose-50/95 text-rose-900 shadow-md shadow-rose-900/5 dark:border-rose-800/70 dark:bg-rose-950/40 dark:text-rose-200'
                      : 'border border-white/70 bg-white/90 text-gray-800 shadow-md shadow-slate-900/5 dark:border-gray-600/60 dark:bg-gray-800/90 dark:text-gray-100'
                }`}
              >
                {msg.role === 'assistant' && msg.pending ? (
                  <span className="text-gray-500 italic dark:text-gray-400">
                    {t('rahj_ai.portal.reply_pending')}
                  </span>
                ) : (
                  <div>
                    <span className="whitespace-pre-wrap break-words"><RichMessageText content={msg.content} /></span>
                    {msg.role === 'assistant' && msg.action && <ActionCard action={msg.action} />}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className={`shrink-0 border-t border-white/50 bg-white/85 p-3 backdrop-blur dark:border-gray-700/60 dark:bg-slate-900/90 ${
          embedded ? 'rounded-b-2xl' : ''
        }`}
      >
        <label className="sr-only" htmlFor={textareaId}>
          {t('rahj_ai.portal.input_placeholder')}
        </label>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/90 bg-white/95 px-1 shadow-inner dark:border-slate-600 dark:bg-slate-800/80">
            <textarea
              ref={textareaRef}
              id={textareaId}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className="rahj-ai-composer-textarea block min-h-[2.75rem] w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-slate-800 focus:outline-none focus:ring-0 dark:text-slate-100"
              placeholder={t('rahj_ai.portal.input_placeholder')}
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className="btn btn-primary btn-icon h-[2.75rem] w-[2.75rem] shrink-0 border border-cyan-300/40 bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-900/25 transition-all hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
