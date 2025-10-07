import React, { useState, useRef, useEffect } from 'react';
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
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState(multiple ? (Array.isArray(value) ? value : []) : []);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchable || searchTerm.trim() === '') return true;
    const displayText = typeof option === 'string' ? option : option.label;
    return displayText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Initialize selected values
  useEffect(() => {
    if (multiple) {
      setSelectedValues(Array.isArray(value) ? value : []);
    }
  }, [value, multiple]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Select Button */}
      <div
        className={`
          w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 
          text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
          ${disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{selectedValues.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span className={getDisplayValue() ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
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
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                
                return (
                  <div
                    key={optionValue || index}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      isOptionSelected ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {optionText}
                      </div>
                      {subtext && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {subtext}
                        </div>
                      )}
                    </div>
                    {isOptionSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select2;
