import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function Print({ title = 'Report', children }) {
  useEffect(() => {
    // Auto-trigger print dialog after page loads
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

  return (
    <>
      <Head title={`${title} - Print`} />
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

          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000;
            background: #fff;
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
        {children}
      </div>
    </>
  );
}
