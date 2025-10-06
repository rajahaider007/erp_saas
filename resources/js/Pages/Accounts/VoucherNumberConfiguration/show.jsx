import React from 'react';
import App from "../../App.jsx";
import { usePage } from '@inertiajs/react';

const ShowVoucherNumberConfiguration = () => {
  const { configuration } = usePage().props;

  // Mock data if not provided
  const config = configuration || {
    id: 1,
    voucher_type: 'Journal',
    prefix: 'JV',
    running_number: 1,
    number_length: 4,
    reset_frequency: 'Yearly',
    is_active: true,
    created_at: '2024-01-15 10:30:00',
    updated_at: '2024-01-15 10:30:00'
  };

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <h1 className="form-title">Voucher Configuration Details</h1>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group">
                <label className="input-label">Voucher Type</label>
                <div className="input-wrapper">
                  <div className="form-input">{config.voucher_type}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Prefix</label>
                <div className="input-wrapper">
                  <div className="form-input">{config.prefix}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Number Length</label>
                <div className="input-wrapper">
                  <div className="form-input">{config.number_length} digits</div>
                </div>
              </div>
            </div>
            <div>
              <div className="input-group">
                <label className="input-label">Reset Frequency</label>
                <div className="input-wrapper">
                  <div className="form-input">{config.reset_frequency}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Current Number</label>
                <div className="input-wrapper">
                  <div className="form-input">{config.running_number}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <div className="input-wrapper">
                  <div className="form-input">{config.is_active ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default ShowVoucherNumberConfiguration;