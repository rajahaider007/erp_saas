import React from 'react';
import { useLayout } from '../../Contexts/LayoutContext';
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
  Zap
} from 'lucide-react';

const Customizer = () => {
  const {
    customizer,
    setCustomizer,
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    headerAsSidebar,
    setHeaderAsSidebar
  } = useLayout();

  const [tempTheme, setTempTheme] = React.useState(theme);
  const [tempSidebarCollapsed, setTempSidebarCollapsed] = React.useState(sidebarCollapsed);
  const [tempHeaderAsSidebar, setTempHeaderAsSidebar] = React.useState(headerAsSidebar);

  // Color schemes
  const colorSchemes = [
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Indigo', value: 'indigo', color: 'bg-indigo-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Red', value: 'red', color: 'bg-red-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
  ];

  const handleApply = () => {
    setTheme(tempTheme);
    setSidebarCollapsed(tempSidebarCollapsed);
    setHeaderAsSidebar(tempHeaderAsSidebar);
    setCustomizer(false);
  };

  const handleReset = () => {
    setTempTheme('light');
    setTempSidebarCollapsed(false);
    setTempHeaderAsSidebar(false);
    setTheme('light');
    setSidebarCollapsed(false);
    setHeaderAsSidebar(false);
  };

  const handleClose = () => {
    // Revert to current settings
    setTempTheme(theme);
    setTempSidebarCollapsed(sidebarCollapsed);
    setTempHeaderAsSidebar(headerAsSidebar);
    setCustomizer(false);
  };

  if (!customizer) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Customizer Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-80 bg-white shadow-2xl dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
        <div className="flex h-full flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Customizer
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Theme Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Theme Mode</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTempTheme('light')}
                  className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-3 transition-all ${
                    tempTheme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Sun className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Light</span>
                </button>
                <button
                  onClick={() => setTempTheme('dark')}
                  className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-3 transition-all ${
                    tempTheme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Moon className="h-5 w-5 text-blue-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark</span>
                </button>
                <button
                  onClick={() => setTempTheme('system')}
                  className={`flex flex-col items-center space-y-2 rounded-lg border-2 p-3 transition-all ${
                    tempTheme === 'system'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <Monitor className="h-5 w-5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">System</span>
                </button>
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
                  onClick={() => setTempHeaderAsSidebar(!tempHeaderAsSidebar)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    tempHeaderAsSidebar
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      tempHeaderAsSidebar ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Collapsed Sidebar */}
              {!tempHeaderAsSidebar && (
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
                    onClick={() => setTempSidebarCollapsed(!tempSidebarCollapsed)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      tempSidebarCollapsed
                        ? 'bg-purple-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        tempSidebarCollapsed ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Color Schemes */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Primary Color</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    className={`flex items-center justify-center rounded-lg border-2 p-3 transition-all ${
                      scheme.value === 'blue'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full ${scheme.color}`} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                More color options available in premium version
              </p>
            </div>

            {/* Performance Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Performance</span>
              </h3>
              <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Animations
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Smooth transitions and effects
                    </p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span className="pointer-events-none inline-block h-5 w-5 translate-x-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Preview
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p>Changes will be applied immediately for preview.</p>
                <p className="mt-2">Note: Some changes may require a page refresh to take full effect.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleApply}
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

export default Customizer;