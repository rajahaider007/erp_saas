import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const TrialBalancePrint = () => {
    const {
        trialBalanceData = [],
        company,
        filters,
        grandTotalDebit = 0,
        grandTotalCredit = 0
    } = usePage().props;

    // Get orientation from URL or default to portrait
    const urlParams = new URLSearchParams(window.location.search);
    const orientation = urlParams.get('orientation') || 'portrait';

    // Check if data is hierarchical or flat
    const isHierarchical = filters?.level === 'all';
    const isFlatData = !isHierarchical && trialBalanceData.length > 0 && !trialBalanceData[0].children;

    useEffect(() => {
        // Auto print when page loads
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

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

    // Render level 4 (transactional accounts)
    const renderLevel4 = (accounts) => {
        if (!accounts || accounts.length === 0) return null;

        return accounts.map((account, index) => (
            <tr key={`l4-${index}`} className="level-4">
                <td>
                    <span className="account-code">{account.account_code}</span>
                    {account.account_name}
                    {account.is_transactional === 1 && (
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
    const renderLevel3 = (level3Accounts) => {
        if (!level3Accounts || Object.keys(level3Accounts).length === 0) return null;

        return Object.values(level3Accounts).map((level3, index) => (
            <React.Fragment key={`l3-${index}`}>
                <tr className="level-3">
                    <td>
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
                {level3.children && level3.children.length > 0 && renderLevel4(level3.children)}
            </React.Fragment>
        ));
    };

    // Render level 2 accounts
    const renderLevel2 = (level2Accounts) => {
        if (!level2Accounts || Object.keys(level2Accounts).length === 0) return null;

        return Object.values(level2Accounts).map((level2, index) => (
            <React.Fragment key={`l2-${index}`}>
                <tr className="level-2">
                    <td>
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
                {level2.children && Object.keys(level2.children).length > 0 && renderLevel3(level2.children)}
            </React.Fragment>
        ));
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
                        <div style={{ fontSize: '7px', color: '#666', marginTop: '2px' }}>
                            Parent: {account.level1_parent_name}
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

        return trialBalanceData.map((level1, index) => (
            <React.Fragment key={`l1-${index}`}>
                <tr className="level-1">
                    <td>
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
                {level1.children && Object.keys(level1.children).length > 0 && renderLevel2(level1.children)}
            </React.Fragment>
        ));
    };

    return (
        <html>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Trial Balance Report - {company?.company_name || 'N/A'}</title>
                <style>{`
          @page {
            size: A4 ${orientation};
            margin: 10mm 8mm;
          }

          @media print {
            @page {
              size: ${orientation};
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 5px;
            font-size: 10px;
          }

          .report-container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .report-header {
            text-align: center;
            padding: 10px 15px;
            border-bottom: 2px solid #e0e0e0;
          }

          .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 2px;
          }

          .company-location {
            font-size: 9px;
            color: #666;
            margin-bottom: 8px;
          }

          .report-title {
            font-size: 14px;
            font-weight: bold;
            color: #2c3e50;
            padding: 8px;
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            display: inline-block;
          }

          .report-info {
            display: flex;
            justify-content: space-between;
            padding: 8px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            font-size: 9px;
          }

          .info-group {
            display: flex;
            gap: 20px;
          }

          .info-item {
            display: flex;
            gap: 8px;
          }

          .info-label {
            font-weight: 600;
            color: #495057;
          }

          .info-value {
            color: #212529;
          }

          .report-body {
            padding: 10px 20px;
          }

          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9px;
          }

          .report-table thead {
            background: #2c3e50;
            color: white;
          }

          .report-table th {
            padding: 8px 10px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
            border: 1px solid #1a252f;
          }

          .report-table th.number-col {
            text-align: right;
            width: 110px;
          }

          .report-table td {
            padding: 5px 10px;
            border: 1px solid #dee2e6;
            font-size: 10px;
            color: #000;
            font-weight: 500;
          }

          .report-table td.number-col {
            text-align: right;
            font-weight: 600;
            color: #000;
          }

          /* Level Styling with different colors */
          .level-1 {
            background: #e3f2fd;
            font-weight: 700;
            font-size: 10px;
            color: #000;
            border-bottom: 2px dashed #1976d2;
          }

          .level-1 td:first-child {
            padding-left: 8px;
          }

          .level-2 {
            background: #f3e5f5;
            font-weight: 600;
            color: #000;
            border-bottom: 1px dashed #9c27b0;
          }

          .level-2 td:first-child {
            padding-left: 16px;
          }

          .level-3 {
            background: #fff3e0;
            font-weight: 500;
            color: #000;
            border-bottom: 1px dashed #ff9800;
          }

          .level-3 td:first-child {
            padding-left: 24px;
          }

          .level-4 {
            background: #e8f5e9;
            color: #000;
            border-bottom: 1px dashed #4caf50;
          }

          .level-4 td:first-child {
            padding-left: 32px;
          }

          .account-code {
            color: #495057;
            font-size: 8px;
            margin-right: 8px;
            font-weight: 600;
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
            background: #3498db;
            color: white;
          }

          .badge-cash {
            background: #95a5a6;
            color: white;
          }

          .badge-trans {
            background: #27ae60;
            color: white;
          }

          .grand-total-row {
            background: #1a252f;
            color: white;
            font-weight: bold;
            font-size: 10px;
          }

          .grand-total-row td {
            padding: 8px;
            border: 2px solid #0d1117;
          }

          .report-footer {
            padding: 8px 20px;
            border-top: 2px solid #e0e0e0;
            background: #f8f9fa;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
            color: #6c757d;
          }

          .amount-debit {
            color: #000 !important;
            font-weight: 600 !important;
          }

          .amount-credit {
            color: #000 !important;
            font-weight: 600 !important;
          }

          .zero-amount {
            color: #6c757d !important;
            font-weight: 500 !important;
          }

          @media print {
                    body {
                        background: white;
                        padding: 0;
                    }
                    
                    .report-container {
                        box-shadow: none;
                    }

                    @page {
                        margin: 10mm;

                        @bottom-right {
                            content: "Page " counter(page) " of " counter(pages);
                            font-size: 9pt; /* Change this to whatever size you want */
                        }
                    }
                    
                    .report-footer {
                        display: none;
        }

        `}</style>
            </head>
            <body>
                <div className="report-container">
                    {/* Report Header */}
                    <div className="report-header">
                        <div className="company-name">{company?.company_name?.toUpperCase() || 'N/A'}</div>
                        <div className="report-title">TRIAL BALANCE REPORT</div>
                    </div>

                    {/* Report Info */}
                    <div className="report-info">
                        <div className="info-group">
                            <div className="info-item">
                                <span className="info-label">PERIOD:</span>
                                <span className="info-value">
                                    {filters?.from_date ? formatDate(filters.from_date) : 'N/A'} to {filters?.to_date ? formatDate(filters.to_date) : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="info-group">
                            <div className="info-item">
                                <span className="info-label">REPORT DATE:</span>
                                <span className="info-value">
                                    {new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Report Body */}
                    <div className="report-body">
                        <table className="report-table">
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
                    </div>

                    {/* Report Footer */}
                    <div className="report-footer">
                        <div>Trial Balance Report | Generated by ERP System</div>
                        <div>Printed on: {new Date().toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })}</div>
                    </div>
                </div>
            </body>
        </html>
    );
};

export default TrialBalancePrint;
