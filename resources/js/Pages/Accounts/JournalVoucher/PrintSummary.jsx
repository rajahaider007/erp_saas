import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const PrintSummary = () => {
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
        <title>Journal Voucher - {voucher?.voucher_number}</title>
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
            font-size: 11pt;
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
            margin-bottom: 6mm;
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
          }

          /* Voucher Info Section */
          .voucher-info {
            display: table;
            width: 100%;
            margin-bottom: 5mm;
            border: 1px solid #000;
          }

          .voucher-info-row {
            display: table-row;
          }

          .voucher-info-cell {
            display: table-cell;
            padding: 2mm 3mm;
            border: 1px solid #000;
            font-size: 10pt;
          }

          .voucher-info-label {
            font-weight: bold;
            width: 25%;
            background: #f5f5f5;
          }

          .voucher-info-value {
            width: 25%;
          }

          /* Entries Table */
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
            padding: 3mm;
            border: 1px solid #000;
            font-size: 10pt;
            text-transform: uppercase;
          }

          .entries-table td {
            padding: 2.5mm 3mm;
            border: 1px solid #000;
            font-size: 10pt;
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

          /* Summary Row */
          .summary-row {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 11pt;
          }

          .summary-row td {
            padding: 3mm;
            border: 2px solid #000;
          }

          /* Narration Section */
          .narration-section {
            margin-top: 5mm;
            margin-bottom: 6mm;
            border: 1px solid #000;
            padding: 3mm;
          }

          .narration-label {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 2mm;
            text-transform: uppercase;
          }

          .narration-text {
            font-size: 10pt;
            line-height: 1.6;
            min-height: 15mm;
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
            width: 33.33%;
            padding: 3mm;
            text-align: center;
            vertical-align: bottom;
          }

          .signature-line {
            border-top: 1px solid #000;
            margin-top: 15mm;
            padding-top: 2mm;
            font-size: 9pt;
            font-weight: bold;
          }

          .signature-label {
            font-size: 8pt;
            color: #666;
            margin-top: 1mm;
          }

          /* Footer */
          .voucher-footer {
            margin-top: 8mm;
            padding-top: 3mm;
            border-top: 1px solid #000;
            font-size: 8pt;
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
            border: 1px solid #000;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
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
              {company?.phone && <div>Phone: {company.phone}</div>}
              {company?.email && <div>Email: {company.email}</div>}
            </div>
            <div className="voucher-title">Journal Voucher - Summary</div>
          </div>

          {/* Voucher Information */}
          <div className="voucher-info">
            <div className="voucher-info-row">
              <div className="voucher-info-cell voucher-info-label">Voucher No:</div>
              <div className="voucher-info-cell voucher-info-value">{voucher?.voucher_number || 'N/A'}</div>
              <div className="voucher-info-cell voucher-info-label">Date:</div>
              <div className="voucher-info-cell voucher-info-value">{formatDate(voucher?.voucher_date)}</div>
            </div>
            <div className="voucher-info-row">
              <div className="voucher-info-cell voucher-info-label">Status:</div>
              <div className="voucher-info-cell voucher-info-value">
                <span className="status-badge">{voucher?.status || 'N/A'}</span>
              </div>
              <div className="voucher-info-cell voucher-info-label">Fiscal Year:</div>
              <div className="voucher-info-cell voucher-info-value">{voucher?.fiscal_year || 'N/A'}</div>
            </div>
          </div>

          {/* Entries Table */}
          <table className="entries-table">
            <thead>
              <tr>
                <th style={{width: '5%'}}>#</th>
                <th style={{width: '45%'}}>Account Description</th>
                <th style={{width: '25%'}} className="text-right">Debit Amount</th>
                <th style={{width: '25%'}} className="text-right">Credit Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id || index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <strong>{entry.account_code || ''}</strong> - {entry.account_name || 'N/A'}
                  </td>
                  <td className="text-right amount-cell">
                    {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                  </td>
                  <td className="text-right amount-cell">
                    {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                  </td>
                </tr>
              ))}
              
              {/* Summary Row */}
              <tr className="summary-row">
                <td colSpan="2" className="text-right">TOTAL:</td>
                <td className="text-right amount-cell">{formatCurrency(totalDebit)}</td>
                <td className="text-right amount-cell">{formatCurrency(totalCredit)}</td>
              </tr>
            </tbody>
          </table>

          {/* Narration */}
          {voucher?.narration && (
            <div className="narration-section">
              <div className="narration-label">Narration / Description:</div>
              <div className="narration-text">{voucher.narration}</div>
            </div>
          )}

          {/* Signature Section */}
          <div className="signature-section">
            <div className="signature-box">
              <div className="signature-line">Prepared By</div>
              <div className="signature-label">Accountant</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">Reviewed By</div>
              <div className="signature-label">Manager</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">Approved By</div>
              <div className="signature-label">Director</div>
            </div>
          </div>

          {/* Footer */}
          <div className="voucher-footer">
            <div>This is a computer-generated document. No signature required.</div>
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

export default PrintSummary;

