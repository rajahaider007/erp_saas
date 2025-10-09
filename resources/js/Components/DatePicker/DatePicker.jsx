import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({
  selected,
  onChange,
  type = 'date', // 'date', 'datetime', 'time', 'year', 'month', 'quarter'
  placeholder = "Select date",
  minDate,
  maxDate,
  disabled = false,
  isClearable = true,
  selectsRange = false,
  selectsMultiple = false,
  showTimeSelect = false,
  timeFormat = "HH:mm",
  dateFormat,
  className = "",
  id,
  name,
  required = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const datePickerRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto format based on type
  const getDateFormat = () => {
    if (dateFormat) return dateFormat;
    
    switch (type) {
      case 'datetime':
        return "dd/MM/yyyy HH:mm";
      case 'time':
        return "HH:mm";
      case 'year':
        return "yyyy";
      case 'month':
        return "MM/yyyy";
      case 'quarter':
        return "QQQ yyyy";
      default:
        return "dd/MM/yyyy";
    }
  };

  // Auto show specific picker based on type
  const getPickerProps = () => {
    switch (type) {
      case 'year':
        return { showYearPicker: true };
      case 'month':
        return { showMonthYearPicker: true };
      case 'quarter':
        return { showQuarterYearPicker: true };
      case 'datetime':
        return { 
          showTimeSelect: true,
          timeFormat: timeFormat,
          timeIntervals: 15,
          timeCaption: "Time"
        };
      case 'time':
        return { 
          showTimeSelect: true,
          showTimeSelectOnly: true,
          timeFormat: timeFormat,
          timeIntervals: 15,
          timeCaption: "Time"
        };
      default:
        return {};
    }
  };

  // Enhanced keyboard navigation handler
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        // Open calendar if closed
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
      
      case 'ArrowUp':
        // Close calendar if open
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
      
      case 'Enter':
        // Toggle calendar or select date
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
      
      case 'Escape':
        // Close calendar
        e.preventDefault();
        setIsOpen(false);
        break;
      
      case 'Tab':
        // Allow tab navigation
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      
      default:
        // Prevent manual typing
        if (e.key !== 'Tab' && e.key !== 'Escape' && e.key !== 'Enter') {
          e.preventDefault();
        }
        break;
    }
  };

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={datePickerRef} className="custom-datepicker-wrapper">
      <DatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={(date) => {
          onChange(date);
          if (!selectsRange && !selectsMultiple) {
            setIsOpen(false);
          }
        }}
        placeholderText={placeholder}
        dateFormat={getDateFormat()}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        isClearable={isClearable}
        selectsRange={selectsRange}
        selectsMultiple={selectsMultiple}
        className={`form-control ${className}`}
        autoComplete="off"
        required={required}
        // Calendar control
        open={isOpen}
        onInputClick={() => setIsOpen(true)}
        onClickOutside={() => setIsOpen(false)}
        // Disable manual typing - only calendar selection
        allowSameDay={true}
        shouldCloseOnSelect={!selectsRange && !selectsMultiple}
        // Better navigation
        showMonthDropdown={true}
        showYearDropdown={true}
        dropdownMode="select"
        scrollableYearDropdown={true}
        yearDropdownItemNumber={15}
        // Better UX
        todayButton="Today"
        showWeekNumbers={false}
        // Mobile optimization
        withPortal={isMobile}
        portalId="datepicker-portal"
        showPopperArrow={!isMobile}
        popperPlacement={isMobile ? "bottom" : "bottom-start"}
        popperModifiers={[
          {
            name: 'preventOverflow',
            options: {
              rootBoundary: 'viewport',
              tether: false,
              altAxis: true,
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'bottom'],
            },
          },
        ]}
        // Keyboard navigation
        strictParsing={false}
        readOnly={false}
        disabledKeyboardNavigation={false}
        onKeyDown={handleKeyDown}
        // Accessibility
        ariaLabelledBy={id ? `${id}-label` : undefined}
        {...getPickerProps()}
        {...props}
      />
    </div>
  );
};

export default CustomDatePicker;
