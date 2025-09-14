import React from 'react';
import App from "../../App.jsx";
import { usePage } from '@inertiajs/react';

const Show = () => {
  const { module } = usePage().props;
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <h1 className="form-title">Module Details</h1>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group"><label className="input-label">Name</label><div className="input-wrapper"><div className="form-input">{module.module_name}</div></div></div>
              <div className="input-group"><label className="input-label">Folder</label><div className="input-wrapper"><div className="form-input">{module.folder_name}</div></div></div>
              <div className="input-group"><label className="input-label">Slug</label><div className="input-wrapper"><div className="form-input">{module.slug}</div></div></div>
            </div>
            <div>
              <div className="input-group"><label className="input-label">Order</label><div className="input-wrapper"><div className="form-input">{module.sort_order ?? 0}</div></div></div>
              <div className="input-group"><label className="input-label">Status</label><div className="input-wrapper"><div className="form-input">{module.status ? 'Active' : 'Inactive'}</div></div></div>
              {module.image_url && (
                <div className="mt-4">
                  <img src={module.image_url} alt={module.module_name} className="h-20" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default Show;


