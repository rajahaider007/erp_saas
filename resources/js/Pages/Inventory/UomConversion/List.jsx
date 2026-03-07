import React, { useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { Search, Plus, Edit3, Trash2, ArrowUpDown, Clock, RefreshCcw, CheckCircle2, X, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';

// SweetAlert-like alert
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>'}[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)"> ${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('#o').addEventListener('click', () => { document.body.removeChild(el); onConfirm && onConfirm(); });
  const c = el.querySelector('#c'); c && c.addEventListener('click', () => { document.body.removeChild(el); onCancel && onCancel(); });
}};

export default function List() {
  const { items: paginatedItems, filters, flash } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.is_active || 'all');
  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'from_uom_id', direction: filters?.sort_order || 'asc' });
  const [currentPage, setCurrentPage] = useState(paginatedItems?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const visibleColumnsInit = useMemo(() => ({
    id: true,
    fromUom: true,
    toUom: true,
    conversionFactor: true,
    conversionDirection: true,
    status: true,
    updatedAt: true,
    actions: true,
  }), []);
  const [visibleColumns, setVisibleColumns] = useState(visibleColumnsInit);

  useEffect(() => { if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); }, [flash]);

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get(window.location.pathname+'?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const handleSearch = (t) => { setSearchTerm(t); pushQuery({ search:t }); };
  const handleStatusFilter = (s) => { setStatusFilter(s); pushQuery({ is_active:s }); };
  const handleSort = (key) => { const dir = sortConfig.key===key && sortConfig.direction==='asc'?'desc':'asc'; setSortConfig({ key, direction:dir }); pushQuery({ sort_by:key, sort_order:dir }); };
  const handlePageChange = (p) => { setCurrentPage(p); pushQuery({ page:p.toString() }); };
  const handlePageSizeChange = (s) => { setPageSize(s); pushQuery({ per_page:s.toString() }); };

  const handleSelectAll = (checked) => { if (checked) setSelected((paginatedItems?.data || []).map(i=>i.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Conversions?', text:`You are about to delete ${selected.length} UOM conversion(s).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=>{ setLoading(true); router.post('/inventory/uom-conversion/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]), onFinish:()=>setLoading(false) }); } }); };
  const handleDelete = (item) => { CustomAlert.fire({ title:'Are you sure?', text:`Delete conversion: ${item.from_uom_code} → ${item.to_uom_code}? This cannot be undone.`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=>{ setLoading(true); router.delete(`/inventory/uom-conversion/${item.id}`, { onFinish:()=>setLoading(false) }); } }); };

  const statusOptions = [ { value:'all', label:'All Status' }, { value:'1', label:'Active' }, { value:'0', label:'Inactive' } ];
  const pageSizeOptions = [10, 25, 50, 100];
  const data = paginatedItems?.data || [];

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><ArrowLeftRight className="title-icon" />{t('inventory.uom_conversion.list.uom_conversion')}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginatedItems?.total || 0} Total</span></div>
                <div className="stat-item"><span>{data.filter(i=>i.is_active).length} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title={t('inventory.uom_conversion.list.refresh')} disabled={loading}><RefreshCcw size={20} className={loading ? 'animate-spin' : ''} /></button>
              <a href="/inventory/uom-conversion/create" className="btn btn-primary"><Plus size={20} />{t('inventory.uom_conversion.list.add_conversion')}</a>
            </div>
          </div>
          <div className="modern-filters-container">
            <div className="filters-toolbar">
              <div className="search-section">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={t('inventory.uom_conversion.list.search_by_fromto_uom_code')}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('inventory.uom_conversion.list.status')}</label>
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

                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    const params = new URLSearchParams();
                    params.set('page', '1');
                    router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                  }}
                  title={t('inventory.uom_conversion.list.reset_all_filters')}
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
          {showColumnSelector && (
            <div className="column-selector">
              <div className="column-selector-content">
                <h3>{t('inventory.uom_conversion.list.showhide_columns')}</h3>
                <div className="column-grid">
                  {Object.entries(visibleColumns).map(([key, visible]) => (key !== 'actions' && (
                    <label key={key} className="column-item">
                      <input type="checkbox" checked={visible} onChange={(e)=>setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} />
                      <span>{key.replace(/([A-Z])/g,' $1').replace(/^./, s=>{t('inventory.uom_conversion.list.stouppercase')}</span>
                    </label>
                  )))}
                </div>
                <button className="btn btn-sm btn-secondary" onClick={()=>{t('inventory.uom_conversion.list.setshowcolumnselectorfalseclose')}</button>
              </div>
            </div>
          )}
        </div>
        {selected.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div>
            <div className="bulk-actions">
              <button className="btn btn-sm btn-secondary" onClick={()=>{t('inventory.uom_conversion.list.setselected')}<X size={16} />{t('inventory.uom_conversion.list.clear')}</button>
              <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />{t('inventory.uom_conversion.list.delete')}</button>
            </div>
          </div>
        )}
        <div className="data-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length === data.length && data.length > 0} onChange={(e)=>{t('inventory.uom_conversion.list.handleselectalletargetchecked_')}</th>
                  {visibleColumns.id && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortid')}<div className="th-content">{t('inventory.uom_conversion.list.id')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='id'?'active':''}`} /></div></th>)}
                  {visibleColumns.fromUom && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortfrom_uom_id')}<div className="th-content">{t('inventory.uom_conversion.list.from_uom')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='from_uom_id'?'active':''}`} /></div></th>)}
                  {visibleColumns.toUom && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortto_uom_id')}<div className="th-content">{t('inventory.uom_conversion.list.to_uom')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='to_uom_id'?'active':''}`} /></div></th>)}
                  {visibleColumns.conversionFactor && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortconversion_factor')}<div className="th-content">{t('inventory.uom_conversion.list.factor')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='conversion_factor'?'active':''}`} /></div></th>)}
                  {visibleColumns.conversionDirection && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortconversion_direction')}<div className="th-content">{t('inventory.uom_conversion.list.direction')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='conversion_direction'?'active':''}`} /></div></th>)}
                  {visibleColumns.status && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortis_active')}<div className="th-content">{t('inventory.uom_conversion.list.status')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='is_active'?'active':''}`} /></div></th>)}
                  {visibleColumns.updatedAt && (<th className="sortable" onClick={()=>{t('inventory.uom_conversion.list.handlesortupdated_at')}<div className="th-content">{t('inventory.uom_conversion.list.updated')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='updated_at'?'active':''}`} /></div></th>)}
                  {visibleColumns.actions && (<th className="actions-header">{t('inventory.uom_conversion.list.actions')}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td><input type="checkbox" className="checkbox" checked={selected.includes(item.id)} onChange={(e)=>{t('inventory.uom_conversion.list.handleselectrowitemid_etargetchecked_')}</td>
                    {visibleColumns.id && (<td><span className="module-id">#{item.id}</span></td>)}
                    {visibleColumns.fromUom && (<td><div className="module-details"><div className="module-name">{item.from_uom_code}</div><div className="module-meta">{item.from_uom_name}</div></div></td>)}
                    {visibleColumns.toUom && (<td><div className="module-details"><div className="module-name">{item.to_uom_code}</div><div className="module-meta">{item.to_uom_name}</div></div></td>)}
                    {visibleColumns.conversionFactor && (<td><span className="badge badge-default">{Number(item.conversion_factor)}</span></td>)}
                    {visibleColumns.conversionDirection && (<td><span className="badge badge-info">{item.conversion_direction || 'Multiply'}</span></td>)}
                    {visibleColumns.status && (<td><span className={`status-badge status-${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>)}
                    {visibleColumns.updatedAt && (<td><div className="date-cell"><Clock size={14} /><span>{item.updated_at ? new Date(item.updated_at).toLocaleString() : '—'}</span></div></td>)}
                    {visibleColumns.actions && (
                      <td>
                        <div className="actions-cell">
                          <button className="action-btn edit" title={t('inventory.uom_conversion.list.edit_conversion')} onClick={() => router.get(`/inventory/uom-conversion/${item.id}/edit`)}>
                            <Edit3 size={16} />
                          </button>
                          <button className="action-btn delete" title={t('inventory.uom_conversion.list.delete_conversion')} onClick={() => handleDelete(item)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-container">
            <div className="pagination-info">
              <div className="results-info">Showing {paginatedItems?.from ?? 0} to {paginatedItems?.to ?? 0} of {paginatedItems?.total ?? 0} entries</div>
              <div className="page-size-selector">
                <span>{t('inventory.uom_conversion.list.show')}</span>
                <select value={pageSize} onChange={(e)=>handlePageSizeChange(Number(e.target.value))} className="page-size-select">
                  {pageSizeOptions.map(size => (<option key={size} value={size}>{size}</option>))}
                </select>
              </div>
            </div>
            <div className="pagination-buttons">
              <button className="btn btn-sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronLeft size={16} />{t('inventory.uom_conversion.list.first')}</button>
              <button className="btn btn-sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
              <span className="pagination-current">Page {paginatedItems?.current_page ?? 1} of {paginatedItems?.last_page ?? 1}</span>
              <button className="btn btn-sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === (paginatedItems?.last_page ?? 1)}><ChevronRight size={16} /></button>
              <button className="btn btn-sm" onClick={() => handlePageChange(paginatedItems?.last_page ?? 1)} disabled={currentPage === (paginatedItems?.last_page ?? 1)}>{t('inventory.uom_conversion.list.last')}<ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
