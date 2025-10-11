import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select an option',
  disabled = false,
  searchable = true,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchable || searchTerm.trim() === '') return true;
    const displayText = typeof option === 'string' ? option : option.label;
    return displayText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get selected option display text
  const getSelectedText = () => {
    const selectedOption = options.find(opt => {
      const optValue = typeof opt === 'string' ? opt : opt.value;
      // Handle both string and number comparisons for edit mode
      return String(optValue) === String(value) || 
             optValue === value || 
             optValue === parseInt(value) || 
             parseInt(optValue) === parseInt(value);
    });
    
    return selectedOption ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label) : '';
  };

  // Handle option selection
  const handleSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    // Convert to string to ensure .trim() works in form validation
    const stringValue = String(optionValue);
    onChange(stringValue);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
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
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the dropdown portal
      if (event.target.closest('[data-portal-dropdown]')) {
        return;
      }
      
      // Don't close if clicking on any input element or if search input is focused
      if (event.target.tagName === 'INPUT' || 
          event.target.type === 'text' ||
          (searchInputRef.current && document.activeElement === searchInputRef.current)) {
        return;
      }
      
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    // Use click instead of mousedown to avoid interfering with input focus
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset highlighted index when dropdown opens and calculate position
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      
      // Calculate dropdown position for portal
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }
  }, [isOpen]);

  // Dropdown component to be rendered in portal
  const DropdownPortal = () => (
    <div 
      className="fixed rounded-lg shadow-lg"
      data-portal-dropdown="true"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        backgroundColor: 'var(--surface)',
        border: '2px solid var(--border)',
        color: 'var(--text-primary)',
        maxHeight: '200px',
        overflow: 'hidden',
        zIndex: 999999,
        borderRadius: '16px',
        boxShadow: 'var(--shadow-hover)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Search Input */}
      {searchable && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
              style={{ color: 'var(--text-secondary)' }} 
            />
              <input
                key="search-input"
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Ensure input stays focused
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                style={{ 
                  paddingLeft: '2.5rem',
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '2px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.transform = 'translateY(-1px)';
                  // Prevent dropdown from closing when search input is focused
                  e.stopPropagation();
                }}
                onBlur={(e) => {
                  // Don't change styles on blur to prevent focus issues
                  // e.target.style.borderColor = 'var(--border)';
                  // e.target.style.transform = 'translateY(0)';
                }}
                onClick={(e) => e.stopPropagation()}
              />
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="max-h-40 overflow-y-auto">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionText = typeof option === 'string' ? option : option.label;
            // Handle both string and number comparisons for selection (edit mode support)
            const isSelected = String(optionValue) === String(value) || 
                              optionValue === value || 
                              optionValue === parseInt(value) || 
                              parseInt(optionValue) === parseInt(value);
            const isHighlighted = index === highlightedIndex;
            
            return (
              <div
                key={optionValue}
                className="px-3 py-2 cursor-pointer transition-colors"
                style={{
                  backgroundColor: isHighlighted ? 'var(--primary-color)' : isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isHighlighted ? 'white' : isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                  borderRadius: '8px',
                  margin: '2px 4px',
                  border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  setHighlightedIndex(index);
                  if (!isSelected) {
                    e.target.style.backgroundColor = 'var(--primary-light)';
                    e.target.style.color = 'var(--primary-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--text-primary)';
                  }
                }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option);
                  }}
              >
                <div className="font-medium text-sm flex items-center justify-between">
                  <span>{optionText}</span>
                  {isSelected && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'white'
                      }}></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            No options found
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} style={{ width: '100%' }}>
      {/* Main Select Button */}
      <div
        className={`
          form-select w-full
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
        style={{ width: '100%' }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
      >
        <div className="flex items-center justify-between">
          <span style={{ 
            color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: value ? '600' : '400'
          }}>
            {getSelectedText() || placeholder}
          </span>
          <div className="flex items-center space-x-1 ml-2">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(''); // Return empty string for form validation
                }}
                className="p-1 hover:bg-gray-200 rounded"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              style={{ color: 'var(--text-secondary)' }} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown rendered via portal */}
      {isOpen && createPortal(<DropdownPortal />, document.body)}
    </div>
  );
};

export default SearchableSelect;
