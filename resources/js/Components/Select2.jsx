import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

const Select2 = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  error = null,
  className = '',
  name = '',
  id = '',
  multiple = false,
  allowClear = true,
  searchable = true,
  tabIndex = 0,
  onKeyDown = () => {},
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState(multiple ? (Array.isArray(value) ? value : []) : []);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);
  
  // Generate unique ID if not provided
  const componentId = useRef(id || `select2-${Math.random().toString(36).substr(2, 9)}`);
  const uniqueId = componentId.current;

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchable || searchTerm.trim() === '') return true;
    const displayText = typeof option === 'string' ? option : option.label;
    return displayText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Debug logging (reduced)
  // console.log('Select2 Debug:', { optionsLength: options.length, isOpen });

  // Initialize selected values
  useEffect(() => {
    if (multiple) {
      setSelectedValues(Array.isArray(value) ? value : []);
    }
  }, [value, multiple]);

  // Close dropdown when clicking outside
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

  // Reset highlighted index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      
      // Calculate dropdown position
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const position = {
          top: rect.bottom + window.scrollY + 4, // Add small gap below the select field
          left: rect.left + window.scrollX,
          width: rect.width
        };
        // console.log('Dropdown position calculated:', position);
        setDropdownPosition(position);
      }
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsListRef.current) {
      const optionElement = optionsListRef.current.querySelector(`[data-option-index="${highlightedIndex}"]`);
      
      if (optionElement) {
        const listElement = optionsListRef.current;
        const optionTop = optionElement.offsetTop;
        const optionBottom = optionTop + optionElement.offsetHeight;
        const listScrollTop = listElement.scrollTop;
        const listHeight = listElement.clientHeight;
        
        // Scroll down if option is below visible area
        if (optionBottom > listScrollTop + listHeight) {
          listElement.scrollTop = optionBottom - listHeight;
        }
        // Scroll up if option is above visible area
        else if (optionTop < listScrollTop) {
          listElement.scrollTop = optionTop;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newValues);
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemove = (valueToRemove) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    setSelectedValues(newValues);
    onChange(newValues);
  };

  const handleClear = () => {
    if (multiple) {
      setSelectedValues([]);
      onChange([]);
    } else {
      onChange('');
    }
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    // Call the parent onKeyDown handler first
    onKeyDown(e);
    
    // Handle Enter key to open/close dropdown or select highlighted option
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        if (!isOpen) {
          setIsOpen(true);
          if (searchable) {
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }, 100);
          }
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          // Select the highlighted option
          handleSelect(filteredOptions[highlightedIndex]);
        }
      }
    }
    
    // Handle Escape key to close dropdown
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
    
    // Handle Arrow keys for navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!disabled) {
        if (!isOpen) {
          setIsOpen(true);
          if (searchable) {
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }, 100);
          }
        } else if (filteredOptions.length > 0) {
          // Navigate down in the dropdown
          setHighlightedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex < filteredOptions.length ? nextIndex : 0;
          });
        }
      }
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!disabled && isOpen && filteredOptions.length > 0) {
        // Navigate up in the dropdown
        setHighlightedIndex(prev => {
          const prevIndex = prev - 1;
          return prevIndex >= 0 ? prevIndex : filteredOptions.length - 1;
        });
      }
    }
    
    // Handle Tab key - let it pass through for normal tab navigation
    if (e.key === 'Tab') {
      // Don't prevent default - let tab navigation work normally
      return;
    }
  };

  const isSelected = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    if (multiple) {
      return selectedValues.includes(optionValue);
    }
    return value === optionValue;
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (selectedValues.length === 0) return '';
      if (selectedValues.length === 1) {
        const option = options.find(opt => 
          (typeof opt === 'string' ? opt : opt.value) === selectedValues[0]
        );
        return typeof option === 'string' ? option : option.label;
      }
      return `${selectedValues.length} selected`;
    }
    
    const selectedOption = options.find(opt => 
      (typeof opt === 'string' ? opt : opt.value) === value
    );
    return selectedOption ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label) : '';
  };

  // Dropdown component to be rendered in portal
  const DropdownComponent = () => (
    <div 
      ref={optionsListRef}
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
        zIndex: 99999,
        boxShadow: 'var(--shadow-hover)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Search Input */}
      {searchable && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
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
              onFocus={(e) => {
                // Prevent dropdown from closing when search input is focused
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                // Handle arrow keys in search input
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  if (filteredOptions.length > 0) {
                    setHighlightedIndex(prev => {
                      const nextIndex = prev + 1;
                      return nextIndex < filteredOptions.length ? nextIndex : 0;
                    });
                  }
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  if (filteredOptions.length > 0) {
                    setHighlightedIndex(prev => {
                      const prevIndex = prev - 1;
                      return prevIndex >= 0 ? prevIndex : filteredOptions.length - 1;
                    });
                  }
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                  }
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsOpen(false);
                  setSearchTerm('');
                  setHighlightedIndex(-1);
                }
              }}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md"
              style={{ 
                paddingLeft: '2.5rem',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="max-h-60 overflow-y-auto">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionText = typeof option === 'string' ? option : option.label;
              const subtext = typeof option === 'object' && option.subtext ? option.subtext : '';
              const isOptionSelected = isSelected(option);
              
              const isHighlighted = index === highlightedIndex;
              
              return (
                <div
                  key={optionValue || index}
                  data-option-index={index}
                  className="px-3 py-2 cursor-pointer flex items-center justify-between transition-colors"
                  style={{
                    backgroundColor: isHighlighted ? 'var(--primary-color)' : isOptionSelected ? 'var(--primary-light)' : 'transparent',
                    color: isHighlighted ? 'white' : isOptionSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                    borderRadius: '8px',
                    margin: '2px 4px',
                    border: isOptionSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div>
                    <div className="font-medium text-sm" style={{ 
                      color: isHighlighted ? 'white' : isOptionSelected ? 'var(--primary-color)' : 'var(--text-primary)' 
                    }}>
                      {optionText}
                    </div>
                    {subtext && (
                      <div className="text-xs" style={{ 
                        color: isHighlighted ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' 
                      }}>
                        {subtext}
                      </div>
                    )}
                  </div>
                  {isOptionSelected && (
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
    <div ref={containerRef} className={`relative ${className}`} style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
      {/* Main Select Button */}
      <div
        className={`
          form-select
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${error ? 'border-red-500' : ''}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}
        `}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : tabIndex}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {multiple && selectedValues.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedValues.slice(0, 3).map((val, index) => {
                  const option = options.find(opt => 
                    (typeof opt === 'string' ? opt : opt.value) === val
                  );
                  const displayText = option ? (typeof option === 'string' ? option : option.label) : val;
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {displayText}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(val);
                        }}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {selectedValues.length > 3 && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    +{selectedValues.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span style={{ 
                color: getDisplayValue() ? 'var(--text-primary)' : 'var(--text-secondary)' 
              }}>
                {getDisplayValue() || placeholder}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {allowClear && (multiple ? selectedValues.length > 0 : value) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </div>

      {/* Dropdown rendered via portal */}
      {isOpen && createPortal(<DropdownComponent />, document.body)}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select2;