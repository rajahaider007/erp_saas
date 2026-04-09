import React, { useEffect, useMemo, useRef, useState } from 'react';
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
                    : msg.error
                      ? 'border border-rose-200/90 bg-rose-50/90 text-rose-900 dark:border-rose-800/70 dark:bg-rose-950/40 dark:text-rose-200'
                      : 'border border-gray-200/80 bg-white/90 text-gray-800 dark:border-gray-600/60 dark:bg-gray-800/90 dark:text-gray-100'
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
                    {msg.role === 'assistant' && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                      <div className="mt-3 border-t border-gray-200/70 pt-2 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
                        <div className="mb-1 font-semibold">Sources</div>
                        {msg.sources.slice(0, 4).map((src, i) => (
                          <div key={`${src.source_path || 'source'}-${i}`} className="mb-1 truncate">
                            {(src.document_title || 'Untitled')} - {(src.section_title || src.table_name || src.source_path || 'Unknown source')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
