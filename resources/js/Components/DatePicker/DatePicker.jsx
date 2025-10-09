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
  const [isMobile, setIsMobile] = useState(false);

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
        return "yyyy-MM-dd HH:mm";
      case 'time':
        return "HH:mm";
      case 'year':
        return "yyyy";
      case 'month':
        return "yyyy-MM";
      case 'quarter':
        return "QQQ yyyy";
      default:
        return "yyyy-MM-dd"; // Database format Y-m-d
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
    // Allow navigation keys but prevent typing
    const allowedKeys = ['Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];
    
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="custom-datepicker-wrapper">
      <DatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={(date) => {
          onChange(date);
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
