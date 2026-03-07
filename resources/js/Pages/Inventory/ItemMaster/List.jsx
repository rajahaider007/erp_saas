import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { Search, Plus, Edit3, Trash2, Download, ChevronDown, ArrowUpDown, Columns, Clock, MoreHorizontal, RefreshCcw, FileText, CheckCircle2, X, Database, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom Alert Component
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>'}[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)"> ${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('#o').addEventListener('click', () => { document.body.removeChild(el); onConfirm && onConfirm(); });
  const c = el.querySelector('#c'); c && c.addEventListener('click', () => { document.body.removeChild(el); onCancel && onCancel(); });
}};

export default function List() {
  const { t } = useTranslations();
  const { items: paginatedItems, filters, flash, error } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'item_code', direction: filters?.sort_direction || 'asc' });
  const [currentPage, setCurrentPage] = useState(paginatedItems?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const visibleColumnsInit = useMemo(() => ({ id: true, itemCode: true, itemName: true, itemType: true, category: true, costingMethod: true, status: true, actions: true }), []);
  const [visibleColumns, setVisibleColumns] = useState(visibleColumnsInit);

  useEffect(() => { if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); }, [flash]);

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get(window.location.pathname+'?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const handleSearch = (t) => { setSearchTerm(t); pushQuery({ search:t }); };
  const handleStatusFilter = (s) => { setStatusFilter(s); pushQuery({ status:s }); };
  const handleSort = (key) => { const dir = sortConfig.key===key && sortConfig.direction==='asc'?'desc':'asc'; setSortConfig({ key, direction:dir }); pushQuery({ sort_by:key, sort_direction:dir }); };
  const handlePageChange = (p) => { setCurrentPage(p); pushQuery({ page:p.toString() }); };
  const handlePageSizeChange = (s) => { setPageSize(s); pushQuery({ per_page:s.toString() }); };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginatedItems.data.map(i=>i.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Items?', text:`You are about to delete ${selected.length} item(s).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=>{ setLoading(true); router.post('/inventory/item-master/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]), onFinish:()=>setLoading(false) }); } }); };
  const handleDelete = (item) => { CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${item.item_name_short}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=>{ setLoading(true); router.delete(`/inventory/item-master/${item.id}`, { onFinish:()=>setLoading(false) }); } }); };

  const statusOptions = [ { value:'all', label:'All Status' }, { value:'1', label:'Active' }, { value:'0', label:'Inactive' } ];
  const pageSizeOptions = [10,25,50,100];

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Database className="title-icon" />{usePage().props?.pageTitle || 'Item Master'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginatedItems?.total || 0} Total Items</span></div>
                <div className="stat-item"><span>{paginatedItems?.data?.filter(i=>i.is_active).length || 0} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title={t('inventory.item_master.list.refresh')} disabled={loading}><RefreshCcw size={20} className={loading ? 'animate-spin' : ''} /></button>
              <a href='/inventory/item-master/create' className="btn btn-primary"><Plus size={20} />{t('inventory.item_master.list.create_item')}</a>
            </div>
          </div>

          {/* Modern Compact Filters */}
          <div className="modern-filters-container">
            <div className="filters-toolbar">
              <div className="search-section">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={t('inventory.item_master.list.search_items_by_code_or_name')}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('inventory.item_master.list.status')}</label>
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                  >
                    {statusOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('inventory.item_master.list.per_page')}</label>
                  <select
                    className="filter-select"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  >
                    {pageSizeOptions.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    const params = new URLSearchParams();
                    params.set('page', '1');
                    router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {selected.length > 0 && (
              <div className="bulk-actions-bar">
                <span>{selected.length} item(s) selected</span>
                <button className="btn-sm btn-danger" onClick={handleBulkDelete}>
                  <Trash2 size={16} /> Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert-error-themed mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Items Table */}
        <div className="table-container">
          {paginatedItems?.data?.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selected.length === paginatedItems.data.length && paginatedItems.data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th onClick={() => handleSort('item_code')} className="sortable-header">
                    Item Code {sortConfig.key === 'item_code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('item_name_short')} className="sortable-header">
                    Item Name {sortConfig.key === 'item_name_short' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>{t('inventory.item_master.list.item_type')}</th>
                  <th>{t('inventory.item_master.list.category')}</th>
                  <th>{t('inventory.item_master.list.costing_method')}</th>
                  <th>{t('inventory.item_master.list.status')}</th>
                  <th style={{ width: '100px' }}>{t('inventory.item_master.list.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                      />
                    </td>
                    <td className="font-mono text-sm font-semibold">{item.item_code}</td>
                    <td>
                      <div>
                        <div className="font-medium">{item.item_name_short}</div>
                        {item.item_name_long && (
                          <div className="text-xs text-gray-500 truncate">{item.item_name_long}</div>
                        )}
                      </div>
                    </td>
                    <td className="text-sm">
                      <span className="badge badge-info">{item.item_type?.replace('_', ' ').toUpperCase()}</span>
                    </td>
                    <td className="text-sm">{item.itemCategory?.category_name || '-'}</td>
                    <td className="text-sm font-mono">{item.costing_method?.toUpperCase()}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <a
                          href={`/inventory/item-master/${item.id}/edit`}
                          className="btn-icon btn-edit"
                          title={t('inventory.item_master.list.edit')}
                        >
                          <Edit3 size={16} />
                        </a>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(item)}
                          title={t('inventory.item_master.list.delete')}
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Database size={48} />
              <h3>{t('inventory.item_master.list.no_items_found')}</h3>
              <p>{t('inventory.item_master.list.no_inventory_items_yet_create_your_first')}</p>
              <a href="/inventory/item-master/create" className="btn btn-primary mt-4">
                <Plus size={20} /> Create Item
              </a>
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginatedItems?.links && paginatedItems.links.length > 1 && (
          <div className="pagination-container">
            {paginatedItems.links.map((link, index) => (
              link.url ? (
                <a
                  key={index}
                  href={link.url}
                  className={`pagination-link ${link.active ? 'active' : ''}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={index}
                  className="pagination-link disabled"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            ))}
          </div>
        )}
      </div>
    </App>
  );
}
