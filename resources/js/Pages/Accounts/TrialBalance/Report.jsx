import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCcw,
  Database,
  Calendar,
  FileText,
  Printer,
  ChevronDown,
  ChevronRight,
  BarChart3,
  ArrowUp
} from 'lucide-react';
import App from '../../App.jsx';

const TrialBalanceReport = () => {
  const { 
    trialBalanceData = [], 
    company, 
    filters, 
    flash, 
    grandTotalDebit = 0, 
    grandTotalCredit = 0 
  } = usePage().props;
  
  const [loading, setLoading] = useState(false);
  const [collapsedLevels, setCollapsedLevels] = useState({});
  const [printOrientation, setPrintOrientation] = useState('portrait');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Check if data is hierarchical or flat
  const isHierarchical = filters?.level === 'all';
  const isFlatData = !isHierarchical && trialBalanceData.length > 0 && !trialBalanceData[0].children;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const toggleCollapse = (level, key) => {
    const collapseKey = `${level}-${key}`;
    setCollapsedLevels(prev => ({
      ...prev,
      [collapseKey]: !prev[collapseKey]
    }));
  };

  const isCollapsed = (level, key) => {
    const collapseKey = `${level}-${key}`;
    return collapsedLevels[collapseKey] || false;
  };

  const expandAll = () => {
    setCollapsedLevels({});
  };

  const collapseAll = () => {
    const newCollapsedLevels = {};
    if (trialBalanceData && Array.isArray(trialBalanceData)) {
      trialBalanceData.forEach((level1, idx1) => {
        newCollapsedLevels[`1-l1-${idx1}`] = true;
        if (level1.children) {
          Object.keys(level1.children).forEach((l2Key) => {
            newCollapsedLevels[`2-l1-${idx1}-${l2Key}`] = true;
            const l2 = level1.children[l2Key];
            if (l2.children) {
              Object.keys(l2.children).forEach((l3Key) => {
                newCollapsedLevels[`3-l1-${idx1}-${l2Key}-${l3Key}`] = true;
              });
            }
          });
        }
      });
    }
    setCollapsedLevels(newCollapsedLevels);
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams(window.location.search);
    window.location.href = '/accounts/trial-balance/export-excel?' + params.toString();
  };

  const handleExportXLSX = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('format', 'xlsx');
    window.location.href = '/accounts/trial-balance/export-excel?' + params.toString();
  };

  const handlePrint = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('orientation', printOrientation);
    window.open('/accounts/trial-balance/print?' + params.toString(), '_blank');
  };

  const handleBackToFilters = () => {
    router.get('/accounts/trial-balance');
  };

  // Render level 4 (transactional accounts)
  const renderLevel4 = (accounts, level3Key) => {
    if (!accounts || accounts.length === 0) return null;

    return accounts.map((account, index) => (
      <tr key={`l4-${level3Key}-${index}`} className="level-4">
        <td>
          <span className="account-code">{account.account_code}</span>
          {account.account_name}
          {account.is_transactional && (
            <span className="badge badge-trans">Transactional</span>
          )}
          {account.is_cash_account && (
            <span className="badge badge-cash">CASH</span>
          )}
        </td>
        <td className="number-col">
          <span className={account.debit_total > 0 ? 'amount-debit' : 'zero-amount'}>
            {formatCurrency(account.debit_total)}
          </span>
        </td>
        <td className="number-col">
          <span className={account.credit_total > 0 ? 'amount-credit' : 'zero-amount'}>
            {formatCurrency(account.credit_total)}
          </span>
        </td>
        <td className="number-col">
          <span className={account.balance !== 0 ? '' : 'zero-amount'}>
            {formatCurrency(account.balance)}
          </span>
        </td>
      </tr>
    ));
  };

  // Render level 3 accounts
  const renderLevel3 = (level3Accounts, level2Key) => {
    if (!level3Accounts || Object.keys(level3Accounts).length === 0) return null;

    return Object.entries(level3Accounts).map(([key, level3]) => {
      const level3Key = `${level2Key}-${key}`;
      const hasChildren = level3.children && level3.children.length > 0;
      const collapsed = isCollapsed(3, level3Key);

      return (
        <React.Fragment key={level3Key}>
          <tr className="level-3">
            <td>
              {hasChildren && (
                <span 
                  className="collapsible-icon"
                  onClick={() => toggleCollapse(3, level3Key)}
                >
                  {collapsed ? '▶' : '▼'}
                </span>
              )}
              <span className="account-code">{level3.account_code}</span>
              {level3.account_name}
              {level3.supports_children && (
                <span className="badge badge-parent">Parent</span>
              )}
              {level3.is_cash_account && (
                <span className="badge badge-cash">CASH</span>
              )}
            </td>
            <td className="number-col">
              <span className={level3.debit_total > 0 ? 'amount-debit' : 'zero-amount'}>
                {formatCurrency(level3.debit_total)}
              </span>
            </td>
            <td className="number-col">
              <span className={level3.credit_total > 0 ? 'amount-credit' : 'zero-amount'}>
                {formatCurrency(level3.credit_total)}
              </span>
            </td>
            <td className="number-col">
              <span className={level3.balance !== 0 ? '' : 'zero-amount'}>
                {formatCurrency(level3.balance)}
              </span>
            </td>
          </tr>
          {!collapsed && hasChildren && renderLevel4(level3.children, level3Key)}
        </React.Fragment>
      );
    });
  };

  // Render level 2 accounts
  const renderLevel2 = (level2Accounts, level1Key) => {
    if (!level2Accounts || Object.keys(level2Accounts).length === 0) return null;

    return Object.entries(level2Accounts).map(([key, level2]) => {
      const level2Key = `${level1Key}-${key}`;
      const hasChildren = level2.children && Object.keys(level2.children).length > 0;
      const collapsed = isCollapsed(2, level2Key);

      return (
        <React.Fragment key={level2Key}>
          <tr className="level-2">
            <td>
              {hasChildren && (
                <span 
                  className="collapsible-icon"
                  onClick={() => toggleCollapse(2, level2Key)}
                >
                  {collapsed ? '▶' : '▼'}
                </span>
              )}
              <span className="account-code">{level2.account_code}</span>
              {level2.account_name}
              {level2.supports_children && (
                <span className="badge badge-parent">Parent</span>
              )}
            </td>
            <td className="number-col">
              <span className={level2.debit_total > 0 ? 'amount-debit' : 'zero-amount'}>
                {formatCurrency(level2.debit_total)}
              </span>
            </td>
            <td className="number-col">
              <span className={level2.credit_total > 0 ? 'amount-credit' : 'zero-amount'}>
                {formatCurrency(level2.credit_total)}
              </span>
            </td>
            <td className="number-col">
              <span className={level2.balance !== 0 ? '' : 'zero-amount'}>
                {formatCurrency(level2.balance)}
              </span>
            </td>
          </tr>
          {!collapsed && hasChildren && renderLevel3(level2.children, level2Key)}
        </React.Fragment>
      );
    });
  };

  // Render flat data for specific level
  const renderFlatData = () => {
    if (!trialBalanceData || trialBalanceData.length === 0) return null;

    return trialBalanceData.map((account, index) => (
      <tr key={`flat-${index}`} className={`level-${account.account_level}`}>
        <td>
          <span className="account-code">{account.account_code}</span>
          {account.account_name}
          {account.level1_parent_name && (
            <div className="text-xs text-gray-500 mt-1">
              Parent Path: {account.level1_parent_name}
              {account.level2_parent_name && ` > ${account.level2_parent_name}`}
              {account.level3_parent_name && ` > ${account.level3_parent_name}`}
            </div>
          )}
          {account.is_transactional === 1 && (
            <span className="badge badge-trans">Transactional</span>
          )}
        </td>
        <td className="number-col">
          <span className={account.debit_total > 0 ? 'amount-debit' : 'zero-amount'}>
            {formatCurrency(account.debit_total)}
          </span>
        </td>
        <td className="number-col">
          <span className={account.credit_total > 0 ? 'amount-credit' : 'zero-amount'}>
            {formatCurrency(account.credit_total)}
          </span>
        </td>
        <td className="number-col">
          <span className={account.balance !== 0 ? '' : 'zero-amount'}>
            {formatCurrency(account.balance)}
          </span>
        </td>
      </tr>
    ));
  };

  // Render level 1 accounts (hierarchical)
  const renderLevel1 = () => {
    if (!trialBalanceData || trialBalanceData.length === 0) return null;

    return trialBalanceData.map((level1, index) => {
      const level1Key = `l1-${index}`;
      const hasChildren = level1.children && Object.keys(level1.children).length > 0;
      const collapsed = isCollapsed(1, level1Key);

      return (
        <React.Fragment key={level1Key}>
          <tr className="level-1">
            <td>
              {hasChildren && (
                <span 
                  className="collapsible-icon"
                  onClick={() => toggleCollapse(1, level1Key)}
                >
                  {collapsed ? '▶' : '▼'}
                </span>
              )}
              <span className="account-code">{level1.account_code}</span>
              <strong>{level1.account_name}</strong>
              <span className="badge badge-parent">Parent</span>
            </td>
            <td className="number-col">
              <span className={level1.debit_total > 0 ? 'amount-debit' : 'zero-amount'}>
                {formatCurrency(level1.debit_total)}
              </span>
            </td>
            <td className="number-col">
              <span className={level1.credit_total > 0 ? 'amount-credit' : 'zero-amount'}>
                {formatCurrency(level1.credit_total)}
              </span>
            </td>
            <td className="number-col">
              <span className={level1.balance !== 0 ? '' : 'zero-amount'}>
                {formatCurrency(level1.balance)}
              </span>
            </td>
          </tr>
          {!collapsed && hasChildren && renderLevel2(level1.children, level1Key)}
        </React.Fragment>
      );
    });
  };

  return (
    <App>
      <div className="advanced-module-manager form-theme-system reports-container">
        {/* Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <BarChart3 className="title-icon" />
                Trial Balance Report
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <FileText size={16} />
                  <span>{company?.company_name || 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>
                    {filters?.from_date ? formatDate(filters.from_date) : 'N/A'} - {filters?.to_date ? formatDate(filters.to_date) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <select 
                value={printOrientation}
                onChange={(e) => setPrintOrientation(e.target.value)}
                className="form-control form-control-sm"
                title="Print Orientation"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
              {isHierarchical && (
                <>
                  <button 
                    className="btn btn-icon" 
                    onClick={expandAll}
                    title="Expand All"
                  >
                    <ChevronDown size={20} />
                  </button>
                  <button 
                    className="btn btn-icon" 
                    onClick={collapseAll}
                    title="Collapse All"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <button 
                className="btn btn-icon" 
                onClick={handleBackToFilters}
                title="Back to Filters"
              >
                <Filter size={20} />
              </button>
              <button 
                className="btn btn-icon" 
                onClick={handlePrint}
                title="Print Report"
              >
                <Printer size={20} />
              </button>
              <button 
                className="btn btn-icon" 
                onClick={handleExportExcel}
                title="Export to CSV"
              >
                <FileText size={20} />
              </button>
              <button 
                className="btn btn-icon" 
                onClick={handleExportXLSX}
                title="Export to Excel (XLSX)"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Applied Filters Display */}
        <div className="applied-filters-container">
          <div className="applied-filters-title">Applied Filters:</div>
          <div className="applied-filters-list">
            {filters?.from_date && (
              <div className="filter-badge">
                <span className="filter-badge-label">From:</span>
                <span className="filter-badge-value">{filters.from_date}</span>
              </div>
            )}
            {filters?.to_date && (
              <div className="filter-badge">
                <span className="filter-badge-label">To:</span>
                <span className="filter-badge-value">{filters.to_date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="report-content">
          <div className="data-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading trial balance...</p>
              </div>
            ) : trialBalanceData?.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No accounts found</h3>
                <p>Try adjusting your filters to see results</p>
                <button 
                  className="btn btn-primary mt-4"
                  onClick={handleBackToFilters}
                >
                  <Filter size={16} />
                  Back to Filters
                </button>
              </div>
            ) : (
              <div className="trial-balance-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ACCOUNT</th>
                      <th className="number-col">DEBIT</th>
                      <th className="number-col">CREDIT</th>
                      <th className="number-col">BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFlatData ? renderFlatData() : renderLevel1()}

                    {/* Grand Total Row */}
                    <tr className="grand-total-row">
                      <td><strong>GRAND TOTAL</strong></td>
                      <td className="number-col">
                        <strong>{formatCurrency(grandTotalDebit)}</strong>
                      </td>
                      <td className="number-col">
                        <strong>{formatCurrency(grandTotalCredit)}</strong>
                      </td>
                      <td className="number-col">
                        <strong>{formatCurrency(grandTotalDebit - grandTotalCredit)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Summary Card */}
                {trialBalanceData.length > 0 && (
                  <div className="report-summary-card">
                    <h3 className="summary-title">Report Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm opacity-80">Total Debit</p>
                        <p className="text-2xl font-bold">{formatCurrency(grandTotalDebit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-80">Total Credit</p>
                        <p className="text-2xl font-bold">{formatCurrency(grandTotalCredit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-80">Difference</p>
                        <p className="text-2xl font-bold">{formatCurrency(Math.abs(grandTotalDebit - grandTotalCredit))}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button 
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </div>

      <style jsx>{`
        .trial-balance-table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background: var(--bg-tertiary, #ffffff);
        }

        .data-table thead {
          background: var(--bg-secondary, #2c3e50);
          color: var(--text-primary, white);
        }

        .data-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid var(--border-color, #1a252f);
        }

        .data-table th.number-col {
          text-align: right;
          width: 150px;
        }

        .data-table td {
          padding: 10px 12px;
          border: 1px solid var(--border-color-light, #334155);
          font-size: 13px;
          background: transparent;
          color: var(--text-secondary, #cbd5e1);
        }

        .data-table td.number-col {
          text-align: right;
          font-family: 'Courier New', monospace;
          font-weight: 500;
        }

        /* Level Styling with theme-aware colors */
        .level-1 {
          background: rgba(52, 152, 219, 0.08);
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary, #fff);
          border-bottom: 3px solid rgba(52, 152, 219, 0.4);
        }

        .level-1 td:first-child {
          padding-left: 12px;
        }

        .level-2 {
          background: rgba(155, 89, 182, 0.06);
          font-weight: 600;
          color: var(--text-secondary, #e2e8f0);
          border-bottom: 2px dashed rgba(155, 89, 182, 0.3);
        }

        .level-2 td:first-child {
          padding-left: 30px;
        }

        .level-3 {
          background: rgba(243, 156, 18, 0.06);
          font-weight: 500;
          color: var(--text-light, #cbd5e1);
          border-bottom: 2px dashed rgba(243, 156, 18, 0.3);
        }

        .level-3 td:first-child {
          padding-left: 50px;
        }

        .level-4 {
          background: rgba(46, 204, 113, 0.05);
          color: var(--text-light, #cbd5e1);
          border-bottom: 1px dashed rgba(46, 204, 113, 0.25);
        }

        .level-4 td:first-child {
          padding-left: 70px;
        }

        .account-code {
          font-family: 'Courier New', monospace;
          color: #94a3b8;
          font-size: 12px;
          margin-right: 10px;
        }

        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          margin-left: 8px;
        }

        .badge-parent {
          background: #3b82f6;
          color: white;
        }

        .badge-cash {
          background: #8b5cf6;
          color: white;
        }

        .badge-trans {
          background: #10b981;
          color: white;
        }

        .grand-total-row {
          background: rgba(0, 0, 0, 0.3);
          color: var(--text-primary, #fff);
          font-weight: bold;
          font-size: 15px;
        }

        .grand-total-row td {
          padding: 18px 12px;
          border: 2px solid rgba(100, 100, 120, 0.5);
        }

        .amount-debit {
          color: #4ade80;
        }

        .amount-credit {
          color: #f87171;
        }

        .zero-amount {
          color: #9ca3af;
        }

        .collapsible-icon {
          cursor: pointer;
          display: inline-block;
          width: 16px;
          text-align: center;
          margin-right: 5px;
          color: #60a5fa;
          font-weight: bold;
          user-select: none;
        }

        .collapsible-icon:hover {
          color: #93c5fd;
        }

        /* Form theme system adjustments */
        .advanced-module-manager.form-theme-system .data-table {
          background: var(--bg-table, #ffffff);
        }

        .advanced-module-manager.form-theme-system.dark .data-table {
          background: var(--bg-dark-table, #1e293b);
        }

        .advanced-module-manager.form-theme-system.dark .data-table td {
          color: var(--text-light, #e2e8f0);
          border-color: var(--border-dark-table, #334155);
        }

        .advanced-module-manager.form-theme-system.dark .data-table thead {
          background: var(--bg-dark-header, #0f172a);
        }

        /* Scroll to Top Button Styling */
        .scroll-to-top-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          z-index: 100;
          transition: all 0.3s ease;
          padding: 0;
        }

        .scroll-to-top-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
        }

        .scroll-to-top-btn:active {
          transform: translateY(-1px);
        }

        .advanced-module-manager.form-theme-system.dark .scroll-to-top-btn {
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
        }

        .advanced-module-manager.form-theme-system.dark .scroll-to-top-btn:hover {
          background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
          box-shadow: 0 15px 35px rgba(124, 58, 237, 0.4);
        }
      `}</style>
    </App>
  );
};

export default TrialBalanceReport;
