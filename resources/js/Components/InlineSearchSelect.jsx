import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Searchable select. Default: dropdown below trigger (absolute).
 * usePortal: render menu in document.body with position:fixed — avoids clipping from
 * overflow:auto parents and stacked panels (e.g. UOM conversion form).
 */
const InlineSearchSelect = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder,
  disabled = false,
  error = null,
  className = '',
  name = '',
  id = '',
  allowClear = true,
  searchable = true,
  tabIndex = 0,
  onKeyDown = () => {},
  usePortal = false,
  ...props
}) => {
  const { t } = useTranslations();
  const displayPlaceholder = placeholder ?? t('common.form.select_an_option');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const uniqueId = useRef(id || `inline-search-${Math.random().toString(36).slice(2, 11)}`).current;

  const [portalBox, setPortalBox] = useState({
    top: 0,
    left: 0,
    width: 200,
    maxH: 280,
  });

  const filteredOptions = options.filter((option) => {
    if (!searchable || !searchTerm.trim()) return true;
    const text = typeof option === 'string' ? option : option.label;
    return String(text).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDisplayValue = () => {
    const opt = options.find((o) => {
      const v = typeof o === 'string' ? o : o.value;
      return String(v) === String(value) || v === value || Number(v) === Number(value);
    });
    return opt ? (typeof opt === 'string' ? opt : opt.label) : '';
  };

  const handleSelect = (option) => {
    const v = typeof option === 'string' ? option : option.value;
    onChange(String(v));
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  useLayoutEffect(() => {
    if (!isOpen || !usePortal) return;

    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const margin = 10;
      const spaceBelow = vh - r.bottom - margin;
      const maxMenu = 280;
      const maxH = Math.min(maxMenu, Math.max(120, spaceBelow));
      setPortalBox({
        top: r.bottom + 4,
        left: r.left,
        width: Math.max(r.width, 200),
        maxH,
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
    };
  }, [isOpen, usePortal]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current?.contains(e.target)) return;
      if (dropdownRef.current?.contains(e.target)) return;
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.dispatchEvent(new CustomEvent('inline-search-select:closeOthers', { detail: uniqueId }));
    const handler = (e) => {
      if (e.detail !== uniqueId) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };
    window.addEventListener('inline-search-select:closeOthers', handler);
    return () => window.removeEventListener('inline-search-select:closeOthers', handler);
  }, [isOpen, uniqueId]);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      const idx = filteredOptions.findIndex((o) => {
        const v = typeof o === 'string' ? o : o.value;
        return String(v) === String(value);
      });
      if (idx >= 0) setHighlightedIndex(idx);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-option-index="${highlightedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [highlightedIndex, isOpen]);

  const handleKeyDownInner = (e) => {
    onKeyDown(e);
    if (e.key === 'Tab') return;
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!disabled) setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const isSelected = (option) => {
    const v = typeof option === 'string' ? option : option.value;
    return String(v) === String(value) || v === value || Number(v) === Number(value);
  };

  const listMaxHeight = usePortal ? Math.max(56, portalBox.maxH - 76) : 220;

  const dropdownNode = isOpen ? (
    <div
      ref={dropdownRef}
      className="rounded-xl shadow-lg border-2 overflow-hidden flex flex-col inline-search-select__dropdown"
      style={
        usePortal
          ? {
              position: 'fixed',
              top: portalBox.top,
              left: portalBox.left,
              width: portalBox.width,
              zIndex: 10050,
              maxHeight: portalBox.maxH,
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              minWidth: 200,
              boxShadow: 'var(--shadow-hover)',
            }
          : {
              position: 'absolute',
              left: 0,
              right: 0,
              top: '100%',
              marginTop: 4,
              zIndex: 9999,
              maxHeight: 280,
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              minWidth: 200,
              boxShadow: 'var(--shadow-hover)',
            }
      }
    >
      {searchable && (
        <div className="p-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('common.form.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
                } else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                  e.preventDefault();
                  handleSelect(filteredOptions[highlightedIndex]);
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsOpen(false);
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{
                border: '2px solid var(--border)',
                borderRadius: 12,
                background: 'var(--surface-hover)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      )}
      <div
        ref={listRef}
        className="overflow-y-auto overscroll-contain flex-1 min-h-0"
        style={{ maxHeight: listMaxHeight, minHeight: 56 }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const v = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            const subtext = typeof option === 'object' && option.subtext ? option.subtext : '';
            const selected = isSelected(option);
            const highlighted = index === highlightedIndex;
            return (
              <div
                key={v ?? index}
                data-option-index={index}
                role="option"
                aria-selected={selected}
                className="px-3 py-2 cursor-pointer transition-colors flex items-center justify-between gap-2"
                style={{
                  backgroundColor: highlighted
                    ? 'var(--primary-color)'
                    : selected
                      ? 'var(--primary-light)'
                      : 'transparent',
                  color: highlighted ? 'white' : selected ? 'var(--primary-color)' : 'var(--text-primary)',
                  borderRadius: 8,
                  margin: '2px 4px',
                  border: selected ? '1px solid var(--primary-color)' : '1px solid transparent',
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option);
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{label}</div>
                  {subtext && (
                    <div
                      className="text-xs truncate"
                      style={{ color: highlighted ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}
                    >
                      {subtext}
                    </div>
                  )}
                </div>
                {selected && (
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: highlighted ? 'rgba(255,255,255,0.3)' : 'var(--primary-color)' }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-3 py-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            {t('common.form.no_options_found')}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      className={`inline-search-select ${className}`}
      style={{ position: 'relative', width: '100%' }}
      data-inline-select-id={uniqueId}
    >
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={displayPlaceholder}
        className={`
          form-select w-full
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${error ? 'border-red-500' : ''}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
        style={{ width: '100%' }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDownInner}
        tabIndex={disabled ? -1 : tabIndex}
        {...props}
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span
            className="truncate min-w-0 flex-1 text-left"
            style={{
              color: getDisplayValue() ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: getDisplayValue() ? 600 : 400,
            }}
            title={getDisplayValue() || displayPlaceholder}
          >
            {getDisplayValue() || displayPlaceholder}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {allowClear && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                style={{ color: 'var(--text-secondary)' }}
                aria-label={t('common.form.clear_selection')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>
        </div>
      </div>

      {usePortal && dropdownNode ? createPortal(dropdownNode, document.body) : dropdownNode}

      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default InlineSearchSelect;
