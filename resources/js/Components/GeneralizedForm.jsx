import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff,
  Search, Calendar, Clock, ChevronDown, Mail, Lock, Shield,
  Type, Folder, Image, ToggleLeft, ToggleRight
} from 'lucide-react';
import InlineSearchSelect from './InlineSearchSelect';
import { useTranslations } from '@/hooks/useTranslations';

// Generalized Form Component
const GeneralizedForm = ({
  title,
  subtitle,
  fields = [],
  onSubmit,
  submitText,
  resetText,
  showReset = true,
  initialData = {},
  formContainerClassName = '',
  formGridClassName = '',
  suggestedPartyCode = null,
}) => {
  const { t } = useTranslations();
  const displayTitle = title ?? t('common.form.default_title');
  const displaySubtitle = subtitle ?? t('common.form.default_subtitle');
  const displaySubmit = submitText ?? t('common.actions.submit');
  const displayReset = resetText ?? t('common.actions.reset');

  const [formData, setFormData] = useState(initialData || {});
  const lastAutoPartyCodeRef = useRef('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [dragActive, setDragActive] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    const field = suggestedPartyCode?.field;
    const value = suggestedPartyCode?.value;
    if (!field || !value || String(value).trim() === '') {
      return;
    }
    const v = String(value).trim();
    setFormData((prev) => {
      const cur = String(prev[field] ?? '').trim();
      if (cur === '' || cur === lastAutoPartyCodeRef.current) {
        lastAutoPartyCodeRef.current = v;
        return { ...prev, [field]: v };
      }
      return prev;
    });
  }, [suggestedPartyCode?.field, suggestedPartyCode?.value]);

  const handleInputChange = (fieldName, value, field) => {
    setAlert(null);
    setFormData((prev) => {
      let next = { ...prev, [fieldName]: value };

      if (fieldName === 'module_name' && value) {
        const folderName = value
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .trim();
        next = { ...next, folder_name: folderName };
      }

      if (field && typeof field.onFormDataPatch === 'function') {
        const patch = field.onFormDataPatch(value, next, prev);
        if (patch && typeof patch === 'object') {
          next = { ...next, ...patch };
        }
      }

      return next;
    });

    if (field && field.onChange) {
      field.onChange(value);
    }
  };
  const handleImageSelect = (fieldName, file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({ ...prev, [fieldName]: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setAlert({
        type: 'error',
        message: t('common.form.invalid_image'),
      });
    }
  };

  const handleDrag = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [fieldName]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fieldName]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(fieldName, e.dataTransfer.files[0]);
    }
  };

  const removeImage = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setImagePreviews(prev => ({ ...prev, [fieldName]: null }));
    if (fileInputRefs.current[fieldName]) {
      fileInputRefs.current[fieldName].value = '';
    }
  };

  const togglePassword = (fieldName) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const validateForm = () => {
    const requiredFields = fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name] === '') {
        setAlert({
          type: 'error',
          message: t('common.form.field_required', { label: field.label }),
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setAlert(null);

    try {
      await onSubmit(formData);
      setAlert({
        type: 'success',
        message: t('common.form.submit_success'),
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || t('common.form.submit_error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData || {});
    setImagePreviews({});
    setAlert(null);
    Object.keys(fileInputRefs.current).forEach(key => {
      if (fileInputRefs.current[key]) {
        fileInputRefs.current[key].value = '';
      }
    });
  };

  const renderField = (field) => {
    const fieldValue = formData[field.name] ?? '';
    const Icon = field.icon;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
        return (
          <div className="input-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper">
              {Icon && <Icon className="input-icon" size={20} />}
              <input
                type={field.type}
                className={`form-input ${Icon ? 'input-with-icon' : ''}`}
                placeholder={field.placeholder}
                title={field.inputTitle || undefined}
                value={fieldValue}
                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                min={field.min}
                max={field.max}
                required={field.required}
                disabled={field.disabled || false}
              />
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="input-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper password-wrapper">
              {Icon && <Icon className="input-icon" size={20} />}
              <input
                type={showPasswords[field.name] ? "text" : "password"}
                className={`form-input ${Icon ? 'input-with-icon' : ''}`}
                placeholder={field.placeholder}
                title={field.inputTitle || undefined}
                value={fieldValue}
                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                required={field.required}
                disabled={field.disabled || false}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePassword(field.name)}
              >
                {showPasswords[field.name] ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="input-group textarea-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper">
              <textarea
                className="form-textarea"
                placeholder={field.placeholder}
                title={field.inputTitle || undefined}
                rows={field.rows || 4}
                value={fieldValue}
                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                required={field.required}
                disabled={field.disabled || false}
              />
            </div>
          </div>
        );

      case 'select':
      // Use InlineSearchSelect for searchable fields, regular select for others
      if (field.searchable) {
        return (
          <div className="input-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper" style={{ overflow: 'visible', position: 'relative' }}>
              <InlineSearchSelect
                options={field.options || []}
                value={fieldValue}
                onChange={(value) => handleInputChange(field.name, value, field)}
                placeholder={field.placeholder || t('common.form.select_option', { label: field.label })}
                disabled={field.disabled || false}
                searchable={true}
                usePortal
              />
            </div>
          </div>
        );
      }
        
        return (
          <div className="input-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper">
              {Icon && <Icon className="input-icon" size={20} />}
              <select
                className={`form-select ${Icon ? 'input-with-icon' : ''}`}
                value={fieldValue}
                onChange={(e) => handleInputChange(field.name, e.target.value, field)}
                disabled={field.disabled || false}
                required={field.required}
              >
                <option value="">{field.placeholder || t('common.form.select_option', { label: field.label })}</option>
                {field.options && field.options.map((option, index) => {
                  const value = typeof option === 'object' ? option.value : option;
                  const label = typeof option === 'object' ? option.label : option;
                  return (
                    <option key={index} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="input-group checkbox-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="checkbox-wrapper">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={!!fieldValue}
                  onChange={(e) => handleInputChange(field.name, e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                {field.checkboxLabel || field.label}
              </label>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="input-group radio-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="radio-wrapper">
              {field.options.map((option) => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    className="form-radio"
                    name={field.name}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                  <span className="radio-custom"></span>
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="input-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper">
              <button
                type="button"
                onClick={() => handleInputChange(field.name, !fieldValue)}
                className={`toggle-button ${fieldValue ? 'active' : ''}`}
              >
                {fieldValue ? (
                  <ToggleRight className="toggle-icon active" size={24} />
                ) : (
                  <ToggleLeft className="toggle-icon" size={24} />
                )}
                <span className="toggle-text">
                  {fieldValue ? t('common.status.active') : t('common.status.inactive')}
                </span>
              </button>
            </div>
          </div>
        );

      case 'file-image':
        return (
          <div className="input-group" key={field.name}>
            <label className="input-label">{field.label}</label>
            <div className="input-wrapper file-wrapper">
              <input
                ref={el => fileInputRefs.current[field.name] = el}
                type="file"
                className="file-input"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleImageSelect(field.name, e.target.files[0])}
              />
              <div
                className={`file-drop-zone ${dragActive[field.name] ? 'drag-active' : ''}`}
                onDragEnter={(e) => handleDrag(e, field.name)}
                onDragLeave={(e) => handleDrag(e, field.name)}
                onDragOver={(e) => handleDrag(e, field.name)}
                onDrop={(e) => handleDrop(e, field.name)}
                onClick={() => fileInputRefs.current[field.name]?.click()}
              >
                {imagePreviews[field.name] ? (
                  <div className="image-preview-container">
                    <img
                      src={imagePreviews[field.name]}
                      alt={t('common.form.preview_alt')}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(field.name);
                      }}
                      className="remove-image-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="file-label">
                    <Upload size={24} />
                    <span className="file-text">
                      {field.placeholder || t('common.form.image_drop_hint')}
                    </span>
                    <span className="file-subtext">{t('common.form.image_formats_hint')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const AlertComponent = ({ type, message }) => {
    const isError = type === 'error';
    const Icon = isError ? AlertCircle : CheckCircle;
    const tone = isError ? 'error' : 'success';

    return (
      <div className={`alert-${tone}-themed flex items-start gap-2`} role={isError ? 'alert' : 'status'}>
        <Icon className="shrink-0 mt-0.5" size={20} aria-hidden />
        <p className="m-0">{message}</p>
      </div>
    );
  };

  return (
    <div className="form-theme-system min-h-screen transition-all duration-500">

      {/* Form Container */}
      <div className={`form-container ${formContainerClassName}`.trim()}>
        <div className="form-header mb-8">
          <h1 className="form-title">{displayTitle}</h1>
          <p className="form-subtitle">{displaySubtitle}</p>
        </div>

        {alert && (
          <div className="mb-6 transform animate-slideIn">
            <AlertComponent type={alert.type} message={alert.message} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={`form-grid ${formGridClassName}`.trim()}>
            {fields.map((field, index) => {
              const showSection =
                field.section &&
                (index === 0 || fields[index - 1].section !== field.section);
              return (
                <React.Fragment key={field.name}>
                  {showSection && (
                    <div className="textarea-group">
                      <h3
                        className="m-0 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {field.section}
                      </h3>
                    </div>
                  )}
                  {renderField(field)}
                </React.Fragment>
              );
            })}
          </div>

          {/* Submit Buttons */}
          <div className="button-group">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="btn-icon animate-spin" size={20} />
                  {t('common.form.processing')}
                </>
              ) : (
                <>
                  <CheckCircle className="btn-icon" size={20} />
                  {displaySubmit}
                </>
              )}
            </button>

            {showReset && (
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                <X className="btn-icon" size={20} />
                {displayReset}
              </button>
            )}
          </div>
        </form>
      </div>


    </div>
  );
};
export default GeneralizedForm;
