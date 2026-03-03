import React from 'react';

/**
 * Breadcrumbs Component
 * 
 * A reusable breadcrumb navigation component
 * 
 * @param {Array} items - Array of breadcrumb items
 * @param {Object} items[].icon - Optional Lucide icon component
 * @param {string} items[].label - Text label for the breadcrumb
 * @param {string} items[].href - Optional link URL (omit for current/last item)
 * @param {string} description - Optional description text below breadcrumbs
 * 
 * @example
 * const breadcrumbItems = [
 *   { icon: Home, label: 'Dashboard', href: '/' },
 *   { icon: Settings, label: 'Settings', href: '/settings' },
 *   { label: 'Profile' }
 * ];
 * <Breadcrumbs items={breadcrumbItems} description="Manage your profile settings" />
 */
const Breadcrumbs = ({ items = [], description = null }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, idx) => (
          <div key={idx} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon 
                  className={`breadcrumb-icon ${
                    item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'
                  }`} 
                />
              )}
              {item.href ? (
                <a href={item.href} className="breadcrumb-link-themed">
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current-themed">
                  {item.label}
                </span>
              )}
            </div>
            {idx < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-full h-full"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>
      {description && (
        <div className="breadcrumbs-description">{description}</div>
      )}
    </div>
  );
};

export default Breadcrumbs;
