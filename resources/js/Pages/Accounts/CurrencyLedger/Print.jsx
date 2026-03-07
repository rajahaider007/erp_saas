import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const CurrencyLedgerPrint = () => {
  const { 
    groupedData = {},
    accounts = [],
    accountTotals = {},
    account, 
    company, 
    filters,
    totalDebit = 0,
    totalCredit = 0
  } = usePage().props;

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
  const { t } = useTranslations();
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };
  
  // Running balance is calculated per account in the grouped display

  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Currency Ledger Report - {account?.account_name || 'All Accounts'}</title>
        <style>{`
          @page {
            size: A4 portrait;
            margin: 15mm 10mm 20mm 10mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #000;
            background: #fff;
          }

          /* Running Header for each page */
          @page {
            @top-center {
              content: element(pageHeader);
            }
            @bottom-center {
              content: element(pageFooter);
            }
          }

          .page-header {
            position: running(pageHeader);
            width: 100%;
            border-bottom: 2px solid #000;
            padding-bottom: 5mm;
            margin-bottom: 5mm;
          }

          .page-footer {
            position: running(pageFooter);
            width: 100%;
            border-top: 1px solid #000;
            padding-top: 3mm;
          }

          .report-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }

          /* Header Section - Repeats on each page */
          .company-header {
            text-align: center;
            padding-bottom: 3mm;
            margin-bottom: 3mm;
            border-bottom: 2px solid #000;
          }

          .company-name {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            margin-bottom: 1mm;
          }

          .company-details {
            font-size: 8pt;
            line-height: 1.4;
            margin-bottom: 2mm;
          }

          .report-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            border: 2px solid #000;
            padding: 2mm 0;
            margin: 3mm 0;
            text-align: center;
            letter-spacing: 1pt;
            background: #f5f5f5;
          }

          /* Account Info Section */
          .account-info {
            display: table;
            width: 100%;
            margin-bottom: 4mm;
            border: 1px solid #000;
            font-size: 8pt;
          }

          .account-info-row {
            display: table-row;
          }

          .account-info-cell {
            display: table-cell;
            padding: 1.5mm 2mm;
            border: 1px solid #000;
          }

          .info-label {
            font-weight: bold;
            width: 15%;
            background: #f5f5f5;
            text-transform: uppercase;
          }

          .info-value {
            width: 35%;
          }

          /* Ledger Table */
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-bottom: 5mm;
            font-size: 6pt;
          }

          .ledger-table th {
            background: #f5f5f5;
            font-weight: bold;
            text-align: left;
            padding: 1.5mm;
            border: 1px solid #000;
            font-size: 6pt;
            text-transform: uppercase;
          }

          .ledger-table td {
            padding: 1mm 1.5mm;
            border: 1px solid #000;
            font-size: 6pt;
            vertical-align: top;
          }

          .ledger-table .text-right {
            text-align: right;
          }

          .ledger-table .text-center {
            text-align: center;
          }

          .ledger-table .amount-cell {
            font-family: 'Courier New', monospace;
            font-weight: bold;
          }

          /* Opening Balance Row */
          .opening-balance-row {
            background: #f0f0f0;
            font-weight: bold;
            font-style: italic;
          }

          /* Summary Row */
          .summary-row {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 8pt;
          }

          .summary-row td {
            padding: 2.5mm;
            border: 2px solid #000;
          }

          /* Closing Balance */
          .closing-balance {
            background: #e5e5e5;
            font-weight: bold;
            font-size: 8pt;
          }

          /* Footer with Page Numbers */
          .report-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            color: #666;
            padding-top: 2mm;
            border-top: 1px solid #000;
          }

          .page-number::after {
            content: "";
          }

          /* Print specific */
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .report-container {
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            /* Page header repeats */
            thead {
              display: table-header-group;
            }

            tfoot {
              display: table-footer-group;
            }

            /* Avoid page breaks inside rows */
            tr {
              page-break-inside: avoid;
            }

            /* Counter for page numbers */
            @page {
              @bottom-right {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 8pt;
                color: #666;
              }
              
              @bottom-center {
                content: "Printed on: " date() " at " time();
                font-size: 7pt;
                color: #666;
              }

              @bottom-left {
                content: "Currency Ledger Report";
                font-size: 7pt;
                color: #666;
              }
            }
          }

        `}</style>
      </head>
      <body>
        <div className="report-container">
          {/* Company Header - Repeats on each page */}
          <div className="company-header">
            <div className="company-name">{company?.company_name || 'Company Name'}</div>
            <div className="company-details">
              {company?.address && <div>{company.address}</div>}
              {company?.city && company?.country && <div>{company.city}, {company.country}</div>}
              {company?.phone && <div>Tel: {company.phone} {company?.email && `| Email: ${company.email}`}</div>}
            </div>
            <div className="report-title">{t('accounts.currency_ledger.print.currency_ledger_report')}</div>
          </div>

          {/* Account Information */}
          <div className="account-info">
            {account && (
              <div className="account-info-row">
                <div className="account-info-cell info-label">{t('accounts.currency_ledger.print.account_code')}</div>
                <div className="account-info-cell info-value">{account.account_code}</div>
                <div className="account-info-cell info-label">{t('accounts.currency_ledger.print.account_name')}</div>
                <div className="account-info-cell info-value">{account.account_name}</div>
              </div>
            )}
            <div className="account-info-row">
              <div className="account-info-cell info-label">{t('accounts.currency_ledger.print.period')}</div>
              <div className="account-info-cell info-value">
                {filters?.from_date ? formatDate(filters.from_date) : 'Beginning'} to {filters?.to_date ? formatDate(filters.to_date) : 'End'}
              </div>
              <div className="account-info-cell info-label">{t('accounts.currency_ledger.print.report_date')}</div>
              <div className="account-info-cell info-value">{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</div>
            </div>
          </div>

          {/* Ledger Table */}
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{width: '2%'}} className="text-center">#</th>
                <th style={{width: '8%'}}>{t('accounts.currency_ledger.print.date')}</th>
                <th style={{width: '10%'}}>{t('accounts.currency_ledger.print.voucher_no')}</th>
                <th style={{width: '6%'}}>{t('accounts.currency_ledger.print.type')}</th>
                <th style={{width: '25%'}}>{t('accounts.currency_ledger.print.description')}</th>
                <th style={{width: '6%'}}>{t('accounts.currency_ledger.print.currency')}</th>
                <th style={{width: '6%'}} className="text-right">{t('accounts.currency_ledger.print.rate')}</th>
                <th style={{width: '9%'}} className="text-right">{t('accounts.currency_ledger.print.debit')}</th>
                <th style={{width: '9%'}} className="text-right">{t('accounts.currency_ledger.print.credit')}</th>
                <th style={{width: '9%'}} className="text-right">{t('accounts.currency_ledger.print.base_debit')}</th>
                <th style={{width: '9%'}} className="text-right">{t('accounts.currency_ledger.print.base_credit')}</th>
                <th style={{width: '10%'}} className="text-right">{t('accounts.currency_ledger.print.balance')}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((accountData) => {
                const accountTransactions = groupedData[accountData.id] || [];
                const totals = accountTotals[accountData.id] || {};
                let runningBalance = parseFloat(totals.opening_balance || 0);

                return (
                  <React.Fragment key={accountData.id}>
                    {/* Account Header */}
                    <tr className="account-header-row">
                      <td colSpan="12" className="text-left font-bold py-2 bg-gray-200">
                        {accountData.account_code} - {accountData.account_name} ({accountData.account_type})
                      </td>
                    </tr>

                    {/* Opening Balance */}
                    {totals.opening_balance !== 0 && (
                      <tr className="opening-balance-row">
                        <td className="text-center">-</td>
                        <td>{t('accounts.currency_ledger.print.opening')}</td>
                        <td>-</td>
                        <td>{t('accounts.currency_ledger.print.balance')}</td>
                        <td>{t('accounts.currency_ledger.print.balance_brought_forward')}</td>
                        <td>-</td>
                        <td className="text-right">-</td>
                        <td className="text-right">-</td>
                        <td className="text-right">-</td>
                        <td className="text-right">-</td>
                        <td className="text-right">-</td>
                        <td className="text-right amount-cell">{formatCurrency(totals.opening_balance || 0)}</td>
                      </tr>
                    )}

                    {/* Transaction Entries */}
                    {accountTransactions.map((entry, index) => {
                      const debit = parseFloat(entry.base_debit_amount) || 0;
                      const credit = parseFloat(entry.base_credit_amount) || 0;
                      runningBalance = runningBalance + debit - credit;

                      return (
                        <tr key={`${accountData.id}-${index}`}>
                          <td className="text-center">{index + 1}</td>
                          <td>{formatDate(entry.voucher_date)}</td>
                          <td>{entry.voucher_number}</td>
                          <td>{entry.voucher_type || 'JV'}</td>
                          <td>{entry.description || entry.narration || '-'}</td>
                          <td>{entry.currency_code || '-'}</td>
                          <td className="text-right amount-cell">
                            {entry.exchange_rate ? formatCurrency(entry.exchange_rate) : '-'}
                          </td>
                          <td className="text-right amount-cell">
                            {entry.debit_amount && parseFloat(entry.debit_amount) > 0 ? formatCurrency(entry.debit_amount) : '-'}
                          </td>
                          <td className="text-right amount-cell">
                            {entry.credit_amount && parseFloat(entry.credit_amount) > 0 ? formatCurrency(entry.credit_amount) : '-'}
                          </td>
                          <td className="text-right amount-cell">
                            {debit > 0 ? formatCurrency(debit) : '-'}
                          </td>
                          <td className="text-right amount-cell">
                            {credit > 0 ? formatCurrency(credit) : '-'}
                          </td>
                          <td className="text-right amount-cell">{formatCurrency(runningBalance)}</td>
                        </tr>
                      );
                    })}

                    {/* Account Totals */}
                    <tr className="summary-row">
                      <td colSpan="6" className="text-right">{t('accounts.currency_ledger.print.account_total')}</td>
                      <td className="text-right">{t('accounts.currency_ledger.print.summary')}</td>
                      <td className="text-right">-</td>
                      <td className="text-right">-</td>
                      <td className="text-right amount-cell">{formatCurrency(totals.total_debit || 0)}</td>
                      <td className="text-right amount-cell">{formatCurrency(totals.total_credit || 0)}</td>
                      <td className="text-right amount-cell">-</td>
                    </tr>

                    {/* Account Closing Balance */}
                    <tr className="closing-balance">
                      <td colSpan="6" className="text-right">{t('accounts.currency_ledger.print.closing_balance')}</td>
                      <td className="text-right">{t('accounts.currency_ledger.print.final_balance')}</td>
                      <td className="text-right">-</td>
                      <td className="text-right">-</td>
                      <td className="text-right">-</td>
                      <td className="text-right">-</td>
                      <td className="text-right amount-cell">{formatCurrency(totals.closing_balance || 0)}</td>
                    </tr>

                    {/* Spacer Row */}
                    <tr>
                      <td colSpan="12" className="h-2"></td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {/* Grand Totals */}
              {accounts.length > 1 && (
                <tr className="grand-total-row">
                  <td colSpan="6" className="text-right font-bold">{t('accounts.currency_ledger.print.grand_total')}</td>
                  <td className="text-right font-bold">{t('accounts.currency_ledger.print.all_accounts')}</td>
                  <td className="text-right">-</td>
                  <td className="text-right">-</td>
                  <td className="text-right amount-cell font-bold">{formatCurrency(totalDebit)}</td>
                  <td className="text-right amount-cell font-bold">{formatCurrency(totalCredit)}</td>
                  <td className="text-right amount-cell">-</td>
                </tr>
              )}
            </tbody>
          </table>


          {/* Footer - Shows on each page */}
          <div className="report-footer">
            <div>{t('accounts.currency_ledger.print.currency_ledger_report__generated_by_erp')}</div>
            <div>Printed on: {new Date().toLocaleString('en-US', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}</div>
            <div className="page-number"></div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default CurrencyLedgerPrint;
