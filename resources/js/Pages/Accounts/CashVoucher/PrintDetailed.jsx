import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const PrintDetailed = () => {
  const { voucher, entries = [], company } = usePage().props;

  useEffect(() => {
    // Auto print when page loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const totalDebit = entries.reduce((sum, entry) => sum + (parseFloat(entry.debit_amount) || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (parseFloat(entry.credit_amount) || 0), 0);

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

  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bank Voucher Detailed - {voucher?.voucher_number}</title>
        <style>{`
          @page {
            size: A4;
            margin: 15mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }

          .voucher-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            background: #fff;
          }

          /* Header Section */
          .voucher-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8mm;
            margin-bottom: 5mm;
          }

          .company-logo {
            width: 60mm;
            max-height: 20mm;
            margin: 0 auto 3mm;
          }

          .company-name {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2mm;
          }

          .company-details {
            font-size: 9pt;
            line-height: 1.6;
            margin-bottom: 3mm;
          }

          .voucher-title {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            border: 2px solid #000;
            padding: 3mm;
            margin-top: 4mm;
            letter-spacing: 2px;
            background: #f5f5f5;
          }

          /* Voucher Info Grid */
          .voucher-info-grid {
            display: table;
            width: 100%;
            margin-bottom: 5mm;
            border: 2px solid #000;
          }

          .voucher-info-row {
            display: table-row;
          }

          .voucher-info-cell {
            display: table-cell;
            padding: 2.5mm 3mm;
            border: 1px solid #000;
            font-size: 9pt;
          }

          .info-label {
            font-weight: bold;
            width: 20%;
            background: #f5f5f5;
            text-transform: uppercase;
            font-size: 8pt;
          }

          .info-value {
            width: 30%;
          }

          /* Detailed Entries Table */
          .entries-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5mm;
            border: 2px solid #000;
          }

          .entries-table th {
            background: #f5f5f5;
            font-weight: bold;
            text-align: left;
            padding: 2.5mm;
            border: 1px solid #000;
            font-size: 8pt;
            text-transform: uppercase;
          }

          .entries-table td {
            padding: 2mm 2.5mm;
            border: 1px solid #000;
            font-size: 9pt;
            vertical-align: top;
          }

          .entries-table .text-right {
            text-align: right;
          }

          .entries-table .text-center {
            text-align: center;
          }

          .entries-table .amount-cell {
            font-family: 'Courier New', monospace;
            font-weight: bold;
          }

          .entry-description {
            font-size: 8pt;
            color: #333;
            font-style: italic;
            margin-top: 1mm;
          }

          /* Summary Section */
          .summary-section {
            border: 2px solid #000;
            padding: 3mm;
            margin-bottom: 5mm;
            background: #f5f5f5;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5mm 0;
            font-size: 10pt;
          }

          .summary-label {
            font-weight: bold;
          }

          .summary-value {
            font-family: 'Courier New', monospace;
            font-weight: bold;
          }

          .summary-total {
            border-top: 2px solid #000;
            margin-top: 2mm;
            padding-top: 2mm;
            font-size: 11pt;
          }

          /* Balance Check */
          .balance-check {
            text-align: center;
            padding: 2mm;
            border: 2px solid #000;
            margin-bottom: 5mm;
            font-weight: bold;
            font-size: 10pt;
          }

          .balance-ok {
            background: #f0f0f0;
          }

          /* Narration Section */
          .narration-section {
            margin-bottom: 6mm;
            border: 1px solid #000;
            padding: 3mm;
          }

          .narration-label {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
          }

          .narration-text {
            font-size: 9pt;
            line-height: 1.6;
            min-height: 15mm;
          }

          /* Audit Trail */
          .audit-section {
            border: 1px solid #000;
            padding: 3mm;
            margin-bottom: 5mm;
            font-size: 8pt;
          }

          .audit-label {
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2mm;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
          }

          .audit-row {
            display: flex;
            justify-content: space-between;
            padding: 1mm 0;
          }

          /* Signature Section */
          .signature-section {
            display: table;
            width: 100%;
            margin-top: 10mm;
            page-break-inside: avoid;
          }

          .signature-box {
            display: table-cell;
            width: 25%;
            padding: 3mm;
            text-align: center;
            vertical-align: bottom;
            border: 1px solid #000;
          }

          .signature-line {
            border-top: 2px solid #000;
            margin-top: 15mm;
            padding-top: 2mm;
            font-size: 9pt;
            font-weight: bold;
          }

          .signature-label {
            font-size: 7pt;
            color: #666;
            margin-top: 1mm;
            text-transform: uppercase;
          }

          .signature-date {
            font-size: 7pt;
            color: #666;
            margin-top: 1mm;
          }

          /* Footer */
          .voucher-footer {
            margin-top: 8mm;
            padding-top: 3mm;
            border-top: 2px solid #000;
            font-size: 7pt;
            text-align: center;
            color: #666;
          }

          /* Print specific */
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .voucher-container {
              padding: 0;
            }

            .no-print {
              display: none !important;
            }

            @page {
              margin: 15mm;
            }
          }

          /* Status Badge */
          .status-badge {
            display: inline-block;
            padding: 1mm 3mm;
            border: 2px solid #000;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
          }

          /* Reference Numbers */
          .ref-number {
            font-family: 'Courier New', monospace;
            font-weight: bold;
          }
        `}</style>
      </head>
      <body>
        <div className="voucher-container">
          {/* Header */}
          <div className="voucher-header">
            <div className="company-name">{company?.company_name || 'Company Name'}</div>
            <div className="company-details">
              {company?.address && <div>{company.address}</div>}
              {company?.city && company?.country && <div>{company.city}, {company.country}</div>}
              {company?.phone && <div>Tel: {company.phone} {company?.fax && `| Fax: ${company.fax}`}</div>}
              {company?.email && <div>Email: {company.email} {company?.website && `| Web: ${company.website}`}</div>}
              {company?.tax_number && <div>Tax ID: {company.tax_number}</div>}
            </div>
            <div className="voucher-title">{t('accounts.cash_voucher.print_detailed.bank_voucher__detailed_report')}</div>
          </div>

          {/* Voucher Information Grid */}
          <div className="voucher-info-grid">
            <div className="voucher-info-row">
              <div className="voucher-info-cell info-label">{t('accounts.cash_voucher.print_detailed.voucher_no')}</div>
              <div className="voucher-info-cell info-value">
                <span className="ref-number">{voucher?.voucher_number || 'N/A'}</span>
              </div>
              <div className="voucher-info-cell info-label">{t('accounts.cash_voucher.print_detailed.voucher_date')}</div>
              <div className="voucher-info-cell info-value">{formatDate(voucher?.voucher_date)}</div>
            </div>
            <div className="voucher-info-row">
              <div className="voucher-info-cell info-label">{t('accounts.cash_voucher.print_detailed.status')}</div>
              <div className="voucher-info-cell info-value">
                <span className="status-badge">{voucher?.status || 'N/A'}</span>
              </div>
              <div className="voucher-info-cell info-label">{t('accounts.cash_voucher.print_detailed.fiscal_year')}</div>
              <div className="voucher-info-cell info-value">{voucher?.fiscal_year || 'N/A'}</div>
            </div>
            <div className="voucher-info-row">
              <div className="voucher-info-cell info-label">{t('accounts.cash_voucher.print_detailed.reference')}</div>
              <div className="voucher-info-cell info-value">{voucher?.reference_no || '-'}</div>
              <div className="voucher-info-cell info-label">{t('accounts.cash_voucher.print_detailed.type')}</div>
              <div className="voucher-info-cell info-value">{voucher?.voucher_type || 'General Journal'}</div>
            </div>
          </div>

          {/* Detailed Entries Table */}
          <table className="entries-table">
            <thead>
              <tr>
                <th style={{width: '4%'}}>#</th>
                <th style={{width: '12%'}}>{t('accounts.cash_voucher.print_detailed.account_code')}</th>
                <th style={{width: '26%'}}>{t('accounts.cash_voucher.print_detailed.account_name')}</th>
                <th style={{width: '24%'}}>{t('accounts.cash_voucher.print_detailed.description')}</th>
                <th style={{width: '17%'}} className="text-right">{t('accounts.cash_voucher.print_detailed.debit')}</th>
                <th style={{width: '17%'}} className="text-right">{t('accounts.cash_voucher.print_detailed.credit')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id || index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="ref-number">{entry.account_code || '-'}</td>
                  <td>{entry.account_name || 'N/A'}</td>
                  <td>
                    <div>{entry.description || '-'}</div>
                    {entry.cost_center && (
                      <div className="entry-description">CC: {entry.cost_center}</div>
                    )}
                  </td>
                  <td className="text-right amount-cell">
                    {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                  </td>
                  <td className="text-right amount-cell">
                    {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <div className="summary-section">
            <div className="summary-row">
              <span className="summary-label">{t('accounts.cash_voucher.print_detailed.total_debit_amount')}</span>
              <span className="summary-value">{formatCurrency(totalDebit)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t('accounts.cash_voucher.print_detailed.total_credit_amount')}</span>
              <span className="summary-value">{formatCurrency(totalCredit)}</span>
            </div>
            <div className="summary-row summary-total">
              <span className="summary-label">{t('accounts.cash_voucher.print_detailed.difference')}</span>
              <span className="summary-value">{formatCurrency(Math.abs(totalDebit - totalCredit))}</span>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`balance-check ${totalDebit === totalCredit ? 'balance-ok' : ''}`}>
            {totalDebit === totalCredit 
              ? '✓ VOUCHER IS BALANCED' 
              : '⚠ WARNING: VOUCHER IS NOT BALANCED'}
          </div>

          {/* Narration */}
          {voucher?.narration && (
            <div className="narration-section">
              <div className="narration-label">{t('accounts.cash_voucher.print_detailed.narration__explanation')}</div>
              <div className="narration-text">{voucher.narration}</div>
            </div>
          )}

          {/* Audit Trail */}
          <div className="audit-section">
            <div className="audit-label">{t('accounts.cash_voucher.print_detailed.audit_trail')}</div>
            <div className="audit-row">
              <span>{t('accounts.cash_voucher.print_detailed.created_by')}</span>
              <span>{voucher?.created_by || 'System'}</span>
              <span>{t('accounts.cash_voucher.print_detailed.created_date')}</span>
              <span>{formatDate(voucher?.created_at)}</span>
            </div>
            {voucher?.posted_by && (
              <div className="audit-row">
                <span>{t('accounts.cash_voucher.print_detailed.posted_by')}</span>
                <span>{voucher.posted_by}</span>
                <span>{t('accounts.cash_voucher.print_detailed.posted_date')}</span>
                <span>{formatDate(voucher.posted_at)}</span>
              </div>
            )}
            {voucher?.approved_by && (
              <div className="audit-row">
                <span>{t('accounts.cash_voucher.print_detailed.approved_by')}</span>
                <span>{voucher.approved_by}</span>
                <span>{t('accounts.cash_voucher.print_detailed.approved_date')}</span>
                <span>{formatDate(voucher.approved_at)}</span>
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <div className="signature-line">{t('accounts.cash_voucher.print_detailed.prepared_by')}</div>
              <div className="signature-label">{t('accounts.cash_voucher.print_detailed.accountant')}</div>
              <div className="signature-date">{t('accounts.cash_voucher.print_detailed.date__________')}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">{t('accounts.cash_voucher.print_detailed.checked_by')}</div>
              <div className="signature-label">{t('accounts.cash_voucher.print_detailed.senior_accountant')}</div>
              <div className="signature-date">{t('accounts.cash_voucher.print_detailed.date__________')}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">{t('accounts.cash_voucher.print_detailed.reviewed_by')}</div>
              <div className="signature-label">{t('accounts.cash_voucher.print_detailed.finance_manager')}</div>
              <div className="signature-date">{t('accounts.cash_voucher.print_detailed.date__________')}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">{t('accounts.cash_voucher.print_detailed.approved_by')}</div>
              <div className="signature-label">{t('accounts.cash_voucher.print_detailed.director__cfo')}</div>
              <div className="signature-date">{t('accounts.cash_voucher.print_detailed.date__________')}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="voucher-footer">
            <div>{t('accounts.cash_voucher.print_detailed.this_is_a_computergenerated_document_and')}</div>
            <div>Document ID: {voucher?.id} | Generated on: {new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</div>
            <div style={{marginTop: '2mm', fontWeight: 'bold'}}>
              ** This document is valid for accounting and audit purposes **
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default PrintDetailed;

