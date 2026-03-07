import React, { useMemo, useState } from 'react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

export default function List() {
  const { items, filters, config, error, flash } = usePage().props;
  const [search, setSearch] = useState(filters?.search || '');
  const [isActive, setIsActive] = useState(filters?.is_active ?? '');

  const columns = useMemo(() => {
    const configured = config?.list_columns || {};
    return Object.keys(configured).map((key) => ({ key, label: configured[key] }));
  }, [config]);

  const pushQuery = (patch = {}) => {
    const params = new URLSearchParams(window.location.search);
    const all = { search, is_active: isActive, ...patch };

    Object.entries(all).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!patch.page) {
      params.set('page', '1');
    }

    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  const onDelete = (id) => {
  const { t } = useTranslations();
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;

    router.delete(`/inventory/master-data/${config.key}/${id}`);
  };

  return (
    <App>
      <div className="rounded-xl bg-white shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{config?.title || 'Master Data'}</h1>
            <p className="text-sm text-gray-500">Total records: {items?.total || 0}</p>
          </div>
          {config?.key && (
            <a
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
              href={`/inventory/master-data/${config.key}/create`}
            >
              Add New
            </a>
          )}
        </div>

        {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
        {flash?.success && <div className="mb-4 rounded-md bg-green-100 p-3 text-green-700">{flash.success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            className="border rounded-md p-2"
            placeholder={t('inventory.master_data.list.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border rounded-md p-2"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          >
            <option value="">{t('inventory.master_data.list.all_status')}</option>
            <option value="1">{t('inventory.master_data.list.active')}</option>
            <option value="0">{t('inventory.master_data.list.inactive')}</option>
          </select>
          <button
            className="px-4 py-2 rounded-md border"
            onClick={() => pushQuery({ search, is_active: isActive })}
          >
            Apply Filters
          </button>
        </div>

        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">{t('inventory.master_data.list.id')}</th>
                {columns.map((column) => (
                  <th key={column.key} className="text-left p-3">{column.label}</th>
                ))}
                <th className="text-left p-3">{t('inventory.master_data.list.status')}</th>
                <th className="text-left p-3">{t('inventory.master_data.list.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(items?.data || []).map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.id}</td>
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.key}`} className="p-3">{String(row[column.key] ?? '')}</td>
                  ))}
                  <td className="p-3">{row.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <a
                        className="px-2 py-1 rounded border"
                        href={`/inventory/master-data/${config.key}/${row.id}/edit`}
                      >
                        Edit
                      </a>
                      <button className="px-2 py-1 rounded border text-red-600" onClick={() => onDelete(row.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(items?.data || []).length === 0 && (
                <tr>
                  <td colSpan={columns.length + 3} className="p-4 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded"
            disabled={!items?.prev_page_url}
            onClick={() => pushQuery({ page: String((items?.current_page || 1) - 1) })}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {items?.current_page || 1} of {items?.last_page || 1}
          </span>
          <button
            className="px-3 py-1 border rounded"
            disabled={!items?.next_page_url}
            onClick={() => pushQuery({ page: String((items?.current_page || 1) + 1) })}
          >
            Next
          </button>
        </div>
      </div>
    </App>
  );
}
