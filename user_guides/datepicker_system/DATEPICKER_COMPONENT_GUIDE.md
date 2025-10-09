# CustomDatePicker Component Guide

A comprehensive guide for using the CustomDatePicker component in the ERP system.

## Overview

The CustomDatePicker is a generalized, reusable DatePicker component built on top of `react-datepicker` for the ERP system. It provides a consistent and user-friendly date selection experience across all modules.

## Features

- ✅ **Multiple Date Types**: Single date, date range, multiple dates
- ✅ **Time Support**: Date + Time, Time only
- ✅ **Year/Month Pickers**: Year only, Month only, Quarter picker
- ✅ **Validation**: Min/Max date limits, disabled dates
- ✅ **Customization**: Custom styling, placeholders, formats
- ✅ **Accessibility**: Keyboard navigation, screen reader support
- ✅ **Localization**: Multi-language support
- ✅ **Responsive**: Mobile-friendly design

## Installation

The component is already installed and configured in the system:

```bash
npm install react-datepicker
```

## Quick Start

### Basic Usage

```jsx
import CustomDatePicker from '../../../Components/DatePicker/DatePicker';

// Basic date selection
<CustomDatePicker
  selected={date}
  onChange={setDate}
  type="date"
  placeholder="Select date"
/>
```

## Date Types & Examples

### 1. Single Date Selection
```jsx
<CustomDatePicker
  selected={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  type="date"
  placeholder="Select date"
  className="form-control"
/>
```

### 2. Date with Time
```jsx
<CustomDatePicker
  selected={dateTime}
  onChange={setDateTime}
  type="datetime"
  placeholder="Select date and time"
  showTimeSelect={true}
  timeFormat="HH:mm"
/>
```

### 3. Time Only
```jsx
<CustomDatePicker
  selected={timeOnly}
  onChange={setTimeOnly}
  type="time"
  placeholder="Select time"
  timeFormat="HH:mm"
/>
```

### 4. Year Only
```jsx
<CustomDatePicker
  selected={yearDate}
  onChange={setYearDate}
  type="year"
  placeholder="Select year"
/>
```

### 5. Month Only
```jsx
<CustomDatePicker
  selected={monthDate}
  onChange={setMonthDate}
  type="month"
  placeholder="Select month"
/>
```

### 6. Quarter Picker
```jsx
<CustomDatePicker
  selected={quarterDate}
  onChange={setQuarterDate}
  type="quarter"
  placeholder="Select quarter"
/>
```

### 7. Date Range Selection
```jsx
<CustomDatePicker
  selected={startDate}
  onChange={setStartDate}
  selectsRange={true}
  startDate={startDate}
  endDate={endDate}
  placeholder="Select date range"
/>
```

### 8. Multiple Dates
```jsx
<CustomDatePicker
  selected={multipleDates}
  onChange={setMultipleDates}
  selectsMultiple={true}
  placeholder="Select multiple dates"
/>
```

## Validation & Limits

### Min/Max Date Limits
```jsx
<CustomDatePicker
  selected={date}
  onChange={setDate}
  type="date"
  minDate={new Date()} // Can't select past dates
  maxDate={addDays(new Date(), 30)} // Can't select beyond 30 days
  placeholder="Select date"
/>
```

### Disabled Dates
```jsx
<CustomDatePicker
  selected={date}
  onChange={setDate}
  type="date"
  excludeDates={[new Date(), addDays(new Date(), 1)]} // Disable specific dates
  placeholder="Select date"
/>
```

### Smart Validation (From/To Date)
```jsx
// From Date - can't be after To Date
<CustomDatePicker
  selected={fromDate ? new Date(fromDate) : null}
  onChange={(date) => setFromDate(date ? date.toISOString().split('T')[0] : '')}
  type="date"
  placeholder="Select from date"
  maxDate={toDate ? new Date(toDate) : new Date()}
  className="form-control"
/>

// To Date - can't be before From Date
<CustomDatePicker
  selected={toDate ? new Date(toDate) : null}
  onChange={(date) => setToDate(date ? date.toISOString().split('T')[0] : '')}
  type="date"
  placeholder="Select to date"
  minDate={fromDate ? new Date(fromDate) : null}
  maxDate={new Date()}
  className="form-control"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | Date\|Array | - | Selected date(s) |
| `onChange` | Function | - | Change handler function |
| `type` | String | 'date' | Type: 'date', 'datetime', 'time', 'year', 'month', 'quarter' |
| `placeholder` | String | 'Select date' | Placeholder text |
| `minDate` | Date | - | Minimum selectable date |
| `maxDate` | Date | - | Maximum selectable date |
| `disabled` | Boolean | false | Disable the input |
| `isClearable` | Boolean | true | Show clear button |
| `selectsRange` | Boolean | false | Enable date range selection |
| `selectsMultiple` | Boolean | false | Enable multiple date selection |
| `dateFormat` | String | Auto | Custom date format |
| `className` | String | '' | Additional CSS classes |
| `id` | String | - | Input ID |
| `name` | String | - | Input name |
| `required` | Boolean | false | Required field validation |

## Date Formats

The component automatically sets date formats based on type, but you can customize them:

### Auto Formats by Type
- `date`: dd/MM/yyyy (15/01/2025)
- `datetime`: dd/MM/yyyy HH:mm (15/01/2025 14:30)
- `time`: HH:mm (14:30)
- `year`: yyyy (2025)
- `month`: MM/yyyy (01/2025)
- `quarter`: QQQ yyyy (Q1 2025)

### Custom Formats
```jsx
<CustomDatePicker
  selected={date}
  onChange={setDate}
  type="date"
  dateFormat="yyyy-MM-dd" // Custom format: 2025-01-15
  placeholder="Select date"
/>
```

## Real-World Examples

### 1. Report Date Range Filter
```jsx
// Used in Currency Ledger and General Ledger Reports
const [fromDate, setFromDate] = useState(getCurrentDate());
const [toDate, setToDate] = useState(getCurrentDate());

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="text-xs font-semibold text-gray-400 mb-2 block">From Date</label>
    <CustomDatePicker
      selected={fromDate ? new Date(fromDate) : null}
      onChange={(date) => setFromDate(date ? date.toISOString().split('T')[0] : '')}
      type="date"
      placeholder="Select from date"
      maxDate={toDate ? new Date(toDate) : new Date()}
      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    />
  </div>
  <div>
    <label className="text-xs font-semibold text-gray-400 mb-2 block">To Date</label>
    <CustomDatePicker
      selected={toDate ? new Date(toDate) : null}
      onChange={(date) => setToDate(date ? date.toISOString().split('T')[0] : '')}
      type="date"
      placeholder="Select to date"
      minDate={fromDate ? new Date(fromDate) : null}
      maxDate={new Date()}
      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
    />
  </div>
</div>
```

### 2. Transaction Date Selection
```jsx
// For Journal Voucher or other transaction forms
<CustomDatePicker
  selected={transactionDate}
  onChange={setTransactionDate}
  type="date"
  placeholder="Transaction Date"
  maxDate={new Date()} // Can't select future dates for transactions
  required={true}
  className="form-control"
/>
```

### 3. Financial Year Selection
```jsx
// For financial reports
<CustomDatePicker
  selected={financialYear}
  onChange={setFinancialYear}
  type="year"
  placeholder="Select Financial Year"
  minDate={new Date(2020, 0, 1)}
  maxDate={new Date()}
  className="form-control"
/>
```

### 4. Month Range for Reports
```jsx
// For monthly reports
<CustomDatePicker
  selected={reportMonth}
  onChange={setReportMonth}
  type="month"
  placeholder="Select Month"
  maxDate={new Date()}
  className="form-control"
/>
```

## Styling & Theming

The component automatically uses the dark theme styling that matches the ERP system:

### Dark Theme Features
- Dark background colors (#1e293b)
- Blue accent colors (#3b82f6)
- Proper contrast ratios
- Hover effects
- Focus states

### Custom Styling
```jsx
<CustomDatePicker
  selected={date}
  onChange={setDate}
  type="date"
  className="custom-date-picker my-custom-class"
  placeholder="Select date"
/>
```

## Accessibility Features

- ✅ **Keyboard Navigation**: Full keyboard support (Tab, Arrow keys, Enter, Escape)
- ✅ **Screen Reader Support**: Proper ARIA labels and descriptions
- ✅ **Focus Management**: Clear focus indicators
- ✅ **Color Contrast**: WCAG compliant contrast ratios

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Lazy Loading**: Component is loaded only when needed
2. **Optimized Rendering**: Efficient re-rendering on date changes
3. **Memory Management**: Proper cleanup on component unmount
4. **Bundle Size**: Optimized build with tree-shaking

## Troubleshooting

### Common Issues

1. **Date not showing**: Ensure the `selected` prop is a valid Date object
2. **Styling issues**: Check if CSS is properly imported
3. **Validation not working**: Verify min/max date props are Date objects
4. **Time not showing**: Ensure `showTimeSelect` is true for datetime type

### Debug Mode
```jsx
<CustomDatePicker
  selected={date}
  onChange={(date) => {
    console.log('Date selected:', date);
    setDate(date);
  }}
  type="date"
  placeholder="Select date"
/>
```

## Integration Checklist

When adding DatePicker to a new component:

- [ ] Import the CustomDatePicker component
- [ ] Set up state for the date value
- [ ] Choose appropriate type (date, datetime, etc.)
- [ ] Add validation if needed (min/max dates)
- [ ] Apply consistent styling
- [ ] Test keyboard navigation
- [ ] Test on mobile devices
- [ ] Add proper labels and accessibility

## Best Practices

1. **Consistent Usage**: Use the same type and styling across similar components
2. **Proper Validation**: Always validate date ranges and limits
3. **User Feedback**: Provide clear error messages for invalid dates
4. **Default Values**: Set sensible defaults (like current date)
5. **Performance**: Avoid unnecessary re-renders
6. **Accessibility**: Always provide proper labels and descriptions

## Support

For issues or questions about the DatePicker component:

1. Check this documentation first
2. Review the component source code
3. Test with different props and configurations
4. Check browser console for errors
5. Verify CSS is properly loaded

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Component Path**: `resources/js/Components/DatePicker/DatePicker.jsx`
