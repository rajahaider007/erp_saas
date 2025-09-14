import React, { useState } from 'react';
import { Eye, EyeOff, Search, Calendar, Clock, Upload, ChevronDown } from 'lucide-react';

const FormThemeSystem = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    email: '',
    password: '',
    number: '',
    checkbox: false,
    radio: 'option1',
    file: null,
    date: '',
    time: '',
    datetime: '',
    month: '',
    week: '',
    range: 50,
    color: '#3B82F6',
    search: '',
    tel: '',
    url: '',
    textarea: '',
    select: '',
    progress: 75,
    meter: 0.8
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="form-theme-system min-h-screen transition-all duration-500">
      {/* Form Container */}
      <div className="form-container">
        <div className="form-grid">
          {/* Text Input */}
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Number Input */}
          <div className="input-group">
            <label className="input-label">Age</label>
            <div className="input-wrapper">
              <input
                type="number"
                className="form-input"
                placeholder="25"
                min="18"
                max="100"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
              />
            </div>
          </div>

          {/* Search Input */}
          <div className="input-group">
            <label className="input-label">Search</label>
            <div className="input-wrapper search-wrapper">
              <Search className="input-icon" size={20} />
              <input
                type="search"
                className="form-input input-with-icon"
                placeholder="Search anything..."
                value={formData.search}
                onChange={(e) => handleInputChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div className="input-wrapper">
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 123-4567"
                value={formData.tel}
                onChange={(e) => handleInputChange('tel', e.target.value)}
              />
            </div>
          </div>

          {/* URL Input */}
          <div className="input-group">
            <label className="input-label">Website URL</label>
            <div className="input-wrapper">
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
              />
            </div>
          </div>

          {/* Date Input */}
          <div className="input-group">
            <label className="input-label">Birth Date</label>
            <div className="input-wrapper date-wrapper">
              <Calendar className="input-icon" size={20} />
              <input
                type="date"
                className="form-input input-with-icon"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
          </div>

          {/* Time Input */}
          <div className="input-group">
            <label className="input-label">Preferred Time</label>
            <div className="input-wrapper time-wrapper">
              <Clock className="input-icon" size={20} />
              <input
                type="time"
                className="form-input input-with-icon"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
              />
            </div>
          </div>

          {/* DateTime Local Input */}
          <div className="input-group">
            <label className="input-label">Appointment</label>
            <div className="input-wrapper">
              <input
                type="datetime-local"
                className="form-input"
                value={formData.datetime}
                onChange={(e) => handleInputChange('datetime', e.target.value)}
              />
            </div>
          </div>

          {/* Month Input */}
          <div className="input-group">
            <label className="input-label">Start Month</label>
            <div className="input-wrapper">
              <input
                type="month"
                className="form-input"
                value={formData.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
              />
            </div>
          </div>

          {/* Week Input */}
          <div className="input-group">
            <label className="input-label">Select Week</label>
            <div className="input-wrapper">
              <input
                type="week"
                className="form-input"
                value={formData.week}
                onChange={(e) => handleInputChange('week', e.target.value)}
              />
            </div>
          </div>

          {/* Color Input */}
          <div className="input-group">
            <label className="input-label">Favorite Color</label>
            <div className="input-wrapper color-wrapper">
              <input
                type="color"
                className="form-input color-input"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
              <span className="color-value">{formData.color}</span>
            </div>
          </div>

          {/* Range Input */}
          <div className="input-group">
            <label className="input-label">Experience Level: {formData.range}%</label>
            <div className="input-wrapper">
              <input
                type="range"
                className="form-range"
                min="0"
                max="100"
                value={formData.range}
                onChange={(e) => handleInputChange('range', e.target.value)}
              />
            </div>
          </div>

          {/* File Input */}
          <div className="input-group">
            <label className="input-label">Upload Resume</label>
            <div className="input-wrapper file-wrapper">
              <input
                type="file"
                className="file-input"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleInputChange('file', e.target.files[0])}
              />
              <div className="file-label">
                <Upload size={20} />
                <span>Choose File</span>
              </div>
            </div>
          </div>

          {/* Select Dropdown */}
          <div className="input-group">
            <label className="input-label">Country</label>
            <div className="input-wrapper select-wrapper">
              <select
                className="form-select"
                value={formData.select}
                onChange={(e) => handleInputChange('select', e.target.value)}
              >
                <option value="">Select Country</option>
                <optgroup label="North America">
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="uk">United Kingdom</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="pk">Pakistan</option>
                  <option value="in">India</option>
                  <option value="jp">Japan</option>
                </optgroup>
              </select>
              <ChevronDown className="select-icon" size={20} />
            </div>
          </div>

          {/* Textarea */}
          <div className="input-group textarea-group">
            <label className="input-label">Message</label>
            <div className="input-wrapper">
              <textarea
                className="form-textarea"
                placeholder="Tell us about yourself..."
                rows="4"
                value={formData.textarea}
                onChange={(e) => handleInputChange('textarea', e.target.value)}
              />
            </div>
          </div>

          {/* Checkbox Group */}
          <div className="input-group checkbox-group">
            <label className="input-label">Preferences</label>
            <div className="checkbox-wrapper">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={formData.checkbox}
                  onChange={(e) => handleInputChange('checkbox', e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                I agree to the terms and conditions
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                />
                <span className="checkbox-custom"></span>
                Subscribe to newsletter
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                />
                <span className="checkbox-custom"></span>
                Enable notifications
              </label>
            </div>
          </div>

          {/* Radio Group */}
          <div className="input-group radio-group">
            <label className="input-label">Subscription Plan</label>
            <div className="radio-wrapper">
              {['basic', 'premium', 'enterprise'].map((plan) => (
                <label key={plan} className="radio-label">
                  <input
                    type="radio"
                    className="form-radio"
                    name="subscription"
                    value={plan}
                    checked={formData.radio === plan}
                    onChange={(e) => handleInputChange('radio', e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="input-group">
            <label className="input-label">Profile Completion</label>
            <div className="progress-wrapper">
              <progress className="form-progress" value={formData.progress} max="100">
                {formData.progress}%
              </progress>
              <span className="progress-text">{formData.progress}%</span>
            </div>
          </div>

          {/* Meter */}
          <div className="input-group">
            <label className="input-label">System Performance</label>
            <div className="meter-wrapper">
              <meter className="form-meter" value={formData.meter} min="0" max="1">
                {Math.round(formData.meter * 100)}%
              </meter>
              <span className="meter-text">{Math.round(formData.meter * 100)}%</span>
            </div>
          </div>

          {/* Output Element */}
          <div className="input-group">
            <label className="input-label">Calculation Result</label>
            <div className="output-wrapper">
              <output className="form-output">
                {formData.number ? `Age in months: ${formData.number * 12}` : 'Enter age to see calculation'}
              </output>
            </div>
          </div>

          {/* Fieldset with Legend */}
          <div className="input-group fieldset-group">
            <fieldset className="form-fieldset">
              <legend className="form-legend">Personal Information</legend>
              <div className="fieldset-content">
                <div className="input-group-small">
                  <label className="input-label">First Name</label>
                  <input type="text" className="form-input" placeholder="John" />
                </div>
                <div className="input-group-small">
                  <label className="input-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Doe" />
                </div>
              </div>
            </fieldset>
          </div>

          {/* Datalist */}
          <div className="input-group">
            <label className="input-label">Programming Language</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                list="languages"
                placeholder="Choose or type a language"
              />
              <datalist id="languages">
                <option value="JavaScript" />
                <option value="Python" />
                <option value="Java" />
                <option value="C++" />
                <option value="TypeScript" />
                <option value="Go" />
                <option value="Rust" />
              </datalist>
            </div>
          </div>

          {/* Buttons */}
          <div className="button-group">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button type="reset" className="btn btn-secondary">
              Reset
            </button>
            <button type="button" className="btn btn-outline">
              Cancel
            </button>
            <input type="submit" className="btn btn-primary" value="Submit Input" />
            <input type="reset" className="btn btn-secondary" value="Reset Input" />
            <input type="button" className="btn btn-outline" value="Button Input" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormThemeSystem;