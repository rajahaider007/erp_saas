import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * Searchable select with dropdown always rendered below the trigger (inline).
 * No portal = no "dropdown above" or wrong position issues when multiple on page.
 * Use for Account/Currency selects in vouchers and any form with many rows.
 */
const InlineSearchSelect = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select an option...',
  disabled = false,
  error = null,
  className = '',
  name = '',
  id = '',
  allowClear = true,
  searchable = true,
  tabIndex = 0,
  onKeyDown = () => {},
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const uniqueId = useRef(id || `inline-search-${Math.random().toString(36).slice(2, 11)}`).current;

  const filteredOptions = options.filter(option => {
    if (!searchable || !searchTerm.trim()) return true;
    const text = typeof option === 'string' ? option : option.label;
    return String(text).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDisplayValue = () => {
    const opt = options.find(o => {
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

  // Click outside: only close if click is not inside this instance's container (including its dropdown)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // When this one opens, tell others to close (single open at a time)
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

  // On open: focus search, reset highlight
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      const idx = filteredOptions.findIndex(o => {
        const v = typeof o === 'string' ? o : o.value;
        return String(v) === String(value);
      });
      if (idx >= 0) setHighlightedIndex(idx);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll highlighted into view
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
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
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
        aria-label={placeholder}
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
        <div className="flex items-center justify-between">
          <span
            className="truncate"
            style={{
              color: getDisplayValue() ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: getDisplayValue() ? 600 : 400,
            }}
            title={getDisplayValue() || placeholder}
          >
            {getDisplayValue() || placeholder}
          </span>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {allowClear && value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Clear"
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

      {/* Inline dropdown: always below trigger, no portal */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 rounded-xl shadow-lg border-2 overflow-hidden flex flex-col"
          style={{
            top: '100%',
            marginTop: 4,
            zIndex: 9999,
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            maxHeight: 280,
            minWidth: 200,
            boxShadow: 'var(--shadow-hover)',
          }}
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
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
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: 220, minHeight: 60 }}
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
                      backgroundColor: highlighted ? 'var(--primary-color)' : selected ? 'var(--primary-light)' : 'transparent',
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
                        <div className="text-xs truncate" style={{ color: highlighted ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}>
                          {subtext}
                        </div>
                      )}
                    </div>
                    {selected && (
                      <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: highlighted ? 'rgba(255,255,255,0.3)' : 'var(--primary-color)' }}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default InlineSearchSelect;
