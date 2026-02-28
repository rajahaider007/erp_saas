import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';

export default function PrintView() {
  const { 
    company,
    balanceSheetData,
    asAtDate,
    currencyCode,
  } = usePage().props;

  const [drillDownData, setDrillDownData] = useState(null);

  // Auto-print effect
  useEffect(() => {
    let printed = false;

    const onAfterPrint = () => {
      if (!printed) {
        printed = true;
        setTimeout(() => {
          window.close();
        }, 500);
      }
    };

    const triggerPrint = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.print();
          }, 500);
        });
      });
    };

    window.addEventListener('afterprint', onAfterPrint);

    if (document.readyState === 'complete') {
      triggerPrint();
    } else {
      window.addEventListener('load', triggerPrint, { once: true });
    }

    return () => {
      window.removeEventListener('load', triggerPrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  const formatCurrency = (value) => {
    const absValue = Math.abs(value || 0);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(absValue);
    
    return value < 0 ? `(${formatted})` : formatted;
  };

  return (
    <>
      <Head title="Balance Sheet - Print" />
      <style>
        {`
          @page {
            size: A4 landscape;
            margin: 20mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000;
            background: #fff;
            width: 100%;
            height: 100%;
          }

          .print-page {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
            background: #fff;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #000;
          }

          .company-name {
            font-size: 20pt;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .report-title {
            font-size: 12pt;
            margin-bottom: 3px;
          }

          .report-info {
            font-size: 10pt;
          }

          .content-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          .column-wrapper {
            display: table-row;
          }

          .column {
            display: table-cell;
            width: 49%;
            vertical-align: top;
            padding: 15px;
            border: 2px solid #000;
          }

          .column:first-child {
            border-right: 1px solid #000;
          }

          .column-title {
            font-size: 13pt;
            font-weight: bold;
            text-align: center;
            padding-bottom: 8px;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            text-transform: uppercase;
          }

          .section {
            margin-bottom: 15px;
          }

          .level1-header {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding: 5px 0;
            margin-bottom: 8px;
          }

          .level2-row {
            font-size: 10pt;
            font-weight: 600;
            padding: 3px 0 3px 10px;
          }

          .level3-row {
            font-size: 10pt;
            padding: 2px 0 2px 20px;
          }

          .row-content {
            display: flex;
            justify-content: space-between;
          }

          .row-label {
            flex: 1;
          }

          .row-amount {
            font-family: 'Courier New', monospace;
            text-align: right;
            min-width: 120px;
          }

          .level2-total {
            font-size: 10pt;
            font-weight: 600;
            padding: 3px 0 3px 10px;
            border-top: 1px solid #000;
            margin-top: 2px;
          }

          .grand-total {
            font-size: 11pt;
            font-weight: bold;
            padding: 8px;
            margin-top: 15px;
            border: 2px solid #000;
            background: #f0f0f0;
          }

          .footer {
            text-align: center;
            font-size: 9pt;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }

          .footer p {
            margin: 3px 0;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .grand-total {
              background: #f0f0f0 !important;
            }
          }
        `}
      </style>
      
      <div className="print-page">
        {/* Header */}
        <div className="header">
          <div className="company-name">{company?.company_name}</div>
          <div className="report-title">Balance Sheet as at {new Date(asAtDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="report-info">Currency: {currencyCode}</div>
        </div>

        {balanceSheetData && (
          <>
            <div className="content-grid">
              <div className="column-wrapper">
                {/* LEFT: Liabilities */}
                <div className="column">
                  <div className="column-title">Liabilities</div>
                  
                  {/* Equity */}
                  {balanceSheetData.equity && balanceSheetData.equity.children && balanceSheetData.equity.children.length > 0 && (
                    <div className="section">
                      <div className="level1-header">
                        <div className="row-content">
                          <span className="row-label">EQUITY</span>
                          <span className="row-amount">{formatCurrency(balanceSheetData.equity.total)}</span>
                        </div>
                      </div>
                      {balanceSheetData.equity.children.map((level2, idx) => (
                        <div key={idx}>
                          <div className="level2-row">
                            <div className="row-content">
                              <span className="row-label">{level2.name}</span>
                              <span className="row-amount">{formatCurrency(level2.total)}</span>
                            </div>
                          </div>
                          {level2.children && level2.children.map((level3, idx3) => (
                            <div key={idx3} className="level3-row">
                              <div className="row-content">
                                <span className="row-label">{level3.name}</span>
                                <span className="row-amount">{formatCurrency(level3.balance)}</span>
                              </div>
                            </div>
                          ))}
                          <div className="level2-total">
                            <div className="row-content">
                              <span className="row-label">Total {level2.name}</span>
                              <span className="row-amount">{formatCurrency(level2.total)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Liabilities */}
                  {balanceSheetData.liabilities && balanceSheetData.liabilities.children && balanceSheetData.liabilities.children.length > 0 && (
                    <div className="section">
                      <div className="level1-header">
                        <div className="row-content">
                          <span className="row-label">LIABILITIES</span>
                          <span className="row-amount">{formatCurrency(balanceSheetData.liabilities.total)}</span>
                        </div>
                      </div>
                      {balanceSheetData.liabilities.children.map((level2, idx) => (
                        <div key={idx}>
                          <div className="level2-row">
                            <div className="row-content">
                              <span className="row-label">{level2.name}</span>
                              <span className="row-amount">{formatCurrency(level2.total)}</span>
                            </div>
                          </div>
                          {level2.children && level2.children.map((level3, idx3) => (
                            <div key={idx3} className="level3-row">
                              <div className="row-content">
                                <span className="row-label">{level3.name}</span>
                                <span className="row-amount">{formatCurrency(level3.balance)}</span>
                              </div>
                            </div>
                          ))}
                          <div className="level2-total">
                            <div className="row-content">
                              <span className="row-label">Total {level2.name}</span>
                              <span className="row-amount">{formatCurrency(level2.total)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="grand-total">
                    <div className="row-content">
                      <span className="row-label">TOTAL LIABILITIES</span>
                      <span className="row-amount">{formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Assets */}
                <div className="column">
                  <div className="column-title">Assets</div>
                  
                  {balanceSheetData.assets && balanceSheetData.assets.children && balanceSheetData.assets.children.length > 0 && (
                    <div className="section">
                      <div className="level1-header">
                        <div className="row-content">
                          <span className="row-label">ASSETS</span>
                          <span className="row-amount">{formatCurrency(balanceSheetData.assets.total)}</span>
                        </div>
                      </div>
                      {balanceSheetData.assets.children.map((level2, idx) => (
                        <div key={idx}>
                          <div className="level2-row">
                            <div className="row-content">
                              <span className="row-label">{level2.name}</span>
                              <span className="row-amount">{formatCurrency(level2.total)}</span>
                            </div>
                          </div>
                          {level2.children && level2.children.map((level3, idx3) => (
                            <div key={idx3} className="level3-row">
                              <div className="row-content">
                                <span className="row-label">{level3.name}</span>
                                <span className="row-amount">{formatCurrency(level3.balance)}</span>
                              </div>
                            </div>
                          ))}
                          <div className="level2-total">
                            <div className="row-content">
                              <span className="row-label">Total {level2.name}</span>
                              <span className="row-amount">{formatCurrency(level2.total)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="grand-total">
                    <div className="row-content">
                      <span className="row-label">TOTAL ASSETS</span>
                      <span className="row-amount">{formatCurrency(balanceSheetData.totalAssets)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer">
              <p>This report has been prepared in accordance with International Accounting Standards (IAS 1).</p>
              <p>Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
