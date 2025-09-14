import React, { useState, useRef } from 'react';
import { useLayout } from '../Contexts/LayoutContext';
import {
  X,
  Settings,
  Monitor,
  Moon,
  Sun,
  Sidebar,
  Layout,
  Palette,
  RotateCcw,
  Check,
  Zap,
  Download,
  Upload,
  Type,
  Minimize,
  Eye,
  EyeOff
} from 'lucide-react';

const IntegratedCustomizer = () => {
  const {
    customizer,
    closeCustomizer,
    applyCustomizerSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    tempSettings,
    updateTempSetting,
    colorSchemes,
    theme,
    primaryColor,
    animationsEnabled,
    compactMode,
    borderRadius,
    fontSize
  } = useLayout();

  const [importResult, setImportResult] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  if (!customizer) return null;

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = importSettings(e.target.result);
        setImportResult(result);
        setTimeout(() => setImportResult(null), 3000);
      };
      reader.readAsText(file);
    }
  };

  const handlePreviewToggle = () => {
    if (previewMode) {
      // Apply temp settings for preview
      const root = document.documentElement;
      
      // Apply theme
      if (tempSettings.theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
      } else {
        root.classList.toggle('dark', tempSettings.theme === 'dark');
      }
      
      // Apply primary color
      const colorConfig = colorSchemes.find(scheme => scheme.value === tempSettings.primaryColor);
      if (colorConfig) {
        root.style.setProperty('--primary-color', colorConfig.primary);
      }
      
      // Apply other settings
      root.classList.toggle('animations-disabled', !tempSettings.animationsEnabled);
      root.classList.toggle('compact-mode', tempSettings.compactMode);
      
      // Remove old classes
      root.classList.remove('radius-small', 'radius-medium', 'radius-large');
      root.classList.remove('font-small', 'font-medium', 'font-large');
      
      // Add new classes
      root.classList.add(`radius-${tempSettings.borderRadius}`);
      root.classList.add(`font-${tempSettings.fontSize}`);
    }
    setPreviewMode(!previewMode);
  };

  const borderRadiusOptions = [
    { value: 'small', label: 'Small', class: 'rounded-sm' },
    { value: 'medium', label: 'Medium', class: 'rounded-md' },
    { value: 'large', label: 'Large', class: 'rounded-lg' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', class: 'text-sm' },
    { value: 'medium', label: 'Medium', class: 'text-base' },
    { value: 'large', label: 'Large', class: 'text-lg' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={closeCustomizer} />

      {/* Customizer Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-80 bg-white shadow-2xl dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
        <div className="flex h-full flex-col">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme Customizer
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviewToggle}
                className={`rounded-md p-1.5 text-sm font-medium transition-colors ${
                  previewMode
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                title={previewMode ? 'Exit Preview' : 'Preview Changes'}
              >
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={closeCustomizer}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Import/Export Results */}
            {importResult && (
              <div className={`border rounded-lg p-4 ${
                importResult.success 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <Check className={`h-5 w-5 ${
                    importResult.success 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    importResult.success 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {importResult.message}
                  </p>
                </div>
              </div>
            )}

            {/* Theme Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Theme Mode</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateTempSetting('theme', 'light')}
                  className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-3 transition-all ${tempSettings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Light</span>
                </button>
                <button
                  onClick={() => updateTempSetting('theme', 'dark')}
                  className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-3 transition-all ${tempSettings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark</span>
                </button>
                <button
                  onClick={() => updateTempSetting('theme', 'system')}
                  className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-3 transition-all ${tempSettings.theme === 'system'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Monitor className="h-5 w-5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">System</span>
                </button>
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Primary Color</span>
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => updateTempSetting('primaryColor', scheme.value)}
                    className={`flex flex-col items-center space-y-1 rounded-lg border-2 p-2 transition-all ${tempSettings.primaryColor === scheme.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                    title={scheme.name}
                  >
                    <div className={`h-6 w-6 rounded-full ${scheme.color}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Layout className="h-4 w-4" />
                <span>Layout Options</span>
              </h3>

              {/* Header as Sidebar */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                    <Sidebar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Header Navigation
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use header as main navigation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => updateTempSetting('headerAsSidebar', !tempSettings.headerAsSidebar)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${tempSettings.headerAsSidebar
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tempSettings.headerAsSidebar ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Collapsed Sidebar */}
              {!tempSettings.headerAsSidebar && (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                      <Sidebar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Collapsed Sidebar
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Show only icons in sidebar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateTempSetting('sidebarCollapsed', !tempSettings.sidebarCollapsed)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${tempSettings.sidebarCollapsed
                      ? 'bg-purple-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tempSettings.sidebarCollapsed ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Compact Mode */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                    <Minimize className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Compact Mode
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Reduce spacing and padding
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => updateTempSetting('compactMode', !tempSettings.compactMode)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${tempSettings.compactMode
                    ? 'bg-green-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tempSettings.compactMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Typography & Styling */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Typography & Styling</span>
              </h3>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateTempSetting('fontSize', option.value)}
                      className={`flex items-center justify-center rounded-lg border-2 p-2 transition-all ${tempSettings.fontSize === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className={`font-medium ${option.class} text-gray-700 dark:text-gray-300`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Border Radius
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {borderRadiusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateTempSetting('borderRadius', option.value)}
                      className={`flex flex-col items-center space-y-1 border-2 p-3 transition-all ${option.class} ${tempSettings.borderRadius === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`h-4 w-8 bg-gray-400 ${option.class}`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Performance</span>
              </h3>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/20">
                    <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Animations
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Smooth transitions and effects
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => updateTempSetting('animationsEnabled', !tempSettings.animationsEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${tempSettings.animationsEnabled
                    ? 'bg-yellow-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tempSettings.animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Import/Export Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings Management</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportSettings}
                  className="flex items-center justify-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>

            {/* Current Settings Summary */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Current Settings
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Theme:</span>
                  <span className="font-medium capitalize">{theme}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Color:</span>
                  <span className="font-medium capitalize">{primaryColor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Font Size:</span>
                  <span className="font-medium capitalize">{fontSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Border Radius:</span>
                  <span className="font-medium capitalize">{borderRadius}</span>
                </div>
                <div className="flex justify-between">
                  <span>Animations:</span>
                  <span className="font-medium">{animationsEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compact Mode:</span>
                  <span className="font-medium">{compactMode ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>

            {/* Preview Notice */}
            {previewMode && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Preview Mode Active
                  </p>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  You're seeing a live preview of your changes. Click "Apply Changes" to save them permanently.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
            <button
              onClick={resetToDefaults}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={applyCustomizerSettings}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Check className="h-4 w-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntegratedCustomizer;