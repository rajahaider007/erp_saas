import React, { useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useLayout } from '../../Contexts/LayoutContext';
import { useTranslations } from '../../hooks/useTranslations';
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
        className={`fixed top-0 right-0 z-[100] flex h-full w-full max-w-[440px] flex-col border-l border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform dark:border-gray-700/50 dark:bg-gray-900/95 ${transitionClass} ${
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
            <div className="header-actions">
              <button
                ref={firstFocusableRef}
                type="button"
                className="btn btn-icon btn-secondary"
                onClick={() => onOpenChange(false)}
                aria-label={t('rahj_ai.portal.close_panel')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <RahjAiChatView variant="drawer" textareaId="rahj-ai-input-drawer" className="min-h-0 flex-1" />
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
