import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { Search, Plus, Edit3, Trash2, Download, ChevronDown, ArrowUpDown, Columns, Clock, MoreHorizontal, RefreshCcw, FileText, CheckCircle2, X, Database, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'class_code', direction: filters?.sort_order || 'asc' });
  const [currentPage, setCurrentPage] = useState(paginatedItems?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const visibleColumnsInit = useMemo(() => ({ id: true, classCode: true, className: true, status: true, updatedAt: true, actions: true }), []);
  const [visibleColumns, setVisibleColumns] = useState(visibleColumnsInit);

  useEffect(() => { if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); }, [flash]);

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get(window.location.pathname+'?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const handleSearch = (t) => { setSearchTerm(t); pushQuery({ search:t }); };
  const handleStatusFilter = (s) => { setStatusFilter(s); pushQuery({ is_active:s }); };
  const handleSort = (key) => { const dir = sortConfig.key===key && sortConfig.direction==='asc'?'desc':'asc'; setSortConfig({ key, direction:dir }); pushQuery({ sort_by:key, sort_order:dir }); };
  const handlePageChange = (p) => { setCurrentPage(p); pushQuery({ page:p.toString() }); };
  const handlePageSizeChange = (s) => { setPageSize(s); pushQuery({ per_page:s.toString() }); };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginatedItems.data.map(i=>i.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Items?', text:`You are about to delete ${selected.length} item class(es).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=>{ setLoading(true); router.post('/inventory/item-class-coding/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]), onFinish:()=>setLoading(false) }); } }); };
  const handleDelete = (item) => { CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${item.class_name}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=>{ setLoading(true); router.delete(`/inventory/item-class-coding/${item.id}`, { onFinish:()=>setLoading(false) }); } }); };

  const statusOptions = [ { value:'all', label:'All Status' }, { value:'1', label:'Active' }, { value:'0', label:'Inactive' } ];
  const pageSizeOptions = [10,25,50,100];

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Database className="title-icon" />{usePage().props?.pageTitle || 'Item Class Coding'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginatedItems?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginatedItems?.data?.filter(i=>i.is_active).length || 0} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title={t('inventory.item_class_coding.list.refresh')} disabled={loading}><RefreshCcw size={20} className={loading ? 'animate-spin' : ''} /></button>
              <a href='/inventory/item-class-coding/create' className="btn btn-primary"><Plus size={20} />{t('inventory.item_class_coding.list.add_item_class')}</a>
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
                    placeholder={t('inventory.item_class_coding.list.search_item_classes')}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('inventory.item_class_coding.list.status')}</label>
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
                  title={t('inventory.item_class_coding.list.reset_all_filters')}
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
          {showColumnSelector && (<div className="column-selector"><div className="column-selector-content"><h3>{t('inventory.item_class_coding.list.showhide_columns')}</h3><div className="column-grid">{Object.entries(visibleColumns).map(([key, visible]) => (key!=='actions' && (<label key={key} className="column-item"><input type="checkbox" checked={visible} onChange={(e)=>setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} /><span>{key.replace(/([A-Z])/g,' $1').replace(/^./, s=>{t('inventory.item_class_coding.list.stouppercase')}</span></label>)))}
          </div><button className="btn btn-sm btn-secondary" onClick={()=>{t('inventory.item_class_coding.list.setshowcolumnselectorfalseclose')}</button></div></div>)}
        </div>
        {selected.length>0 && (<div className="bulk-actions-bar"><div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div><div className="bulk-actions"><button className="btn btn-sm btn-secondary" onClick={()=>{t('inventory.item_class_coding.list.setselected')}<X size={16} />{t('inventory.item_class_coding.list.clear')}</button><button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />{t('inventory.item_class_coding.list.delete')}</button></div></div>)}
        <div className="data-table-container"><div className="table-wrapper"><table className="data-table"><thead><tr>
          <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===paginatedItems.data.length && paginatedItems.data.length>0} onChange={(e)=>{t('inventory.item_class_coding.list.handleselectalletargetchecked_')}</th>
          {visibleColumns.id && (<th className="sortable" onClick={()=>{t('inventory.item_class_coding.list.handlesortid')}<div className="th-content">{t('inventory.item_class_coding.list.id')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='id'?'active':''}`} /></div></th>)}
          {visibleColumns.classCode && (<th className="sortable" onClick={()=>{t('inventory.item_class_coding.list.handlesortclass_code')}<div className="th-content">{t('inventory.item_class_coding.list.class_code')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='class_code'?'active':''}`} /></div></th>)}
          {visibleColumns.className && (<th className="sortable" onClick={()=>{t('inventory.item_class_coding.list.handlesortclass_name')}<div className="th-content">{t('inventory.item_class_coding.list.class_name')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='class_name'?'active':''}`} /></div></th>)}
          {visibleColumns.status && (<th className="sortable" onClick={()=>{t('inventory.item_class_coding.list.handlesortis_active')}<div className="th-content">{t('inventory.item_class_coding.list.status')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='is_active'?'active':''}`} /></div></th>)}
          {visibleColumns.updatedAt && (<th className="sortable" onClick={()=>{t('inventory.item_class_coding.list.handlesortupdated_at')}<div className="th-content">{t('inventory.item_class_coding.list.updated')}<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='updated_at'?'active':''}`} /></div></th>)}
          {visibleColumns.actions && (<th className="actions-header">{t('inventory.item_class_coding.list.actions')}</th>)}
        </tr></thead><tbody>
          {paginatedItems.data.map((item) => (
            <tr key={item.id} className="table-row">
              <td><input type="checkbox" className="checkbox" checked={selected.includes(item.id)} onChange={(e)=>{t('inventory.item_class_coding.list.handleselectrowitemid_etargetchecked_')}</td>
              {visibleColumns.id && (<td><span className="module-id">#{item.id}</span></td>)}
              {visibleColumns.classCode && (<td><div className="module-details"><div className="module-name">{item.class_code}</div></div></td>)}
              {visibleColumns.className && (<td><div className="module-details"><div className="module-name">{item.class_name}</div></div></td>)}
              {visibleColumns.status && (<td><span className={`status-badge status-${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>)}
              {visibleColumns.updatedAt && (<td><div className="date-cell"><Clock size={14} /><span>{new Date(item.updated_at).toLocaleString()}</span></div></td>)}
              {visibleColumns.actions && (
                <td>
                  <div className="actions-cell">
                    <button className="action-btn edit" title={t('inventory.item_class_coding.list.edit_item_class')} onClick={() => router.get(`/inventory/item-class-coding/${item.id}/edit`)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="action-btn delete" title={t('inventory.item_class_coding.list.delete_item_class')} onClick={() => handleDelete(item)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody></table></div>
        <div className="pagination-container">
          <div className="pagination-info">
            <div className="results-info">Showing {paginatedItems.from || 0} to {paginatedItems.to || 0} of {paginatedItems.total || 0} entries</div>
            <div className="page-size-selector">
              <span>{t('inventory.item_class_coding.list.show')}</span>
              <select value={pageSize} onChange={(e)=>handlePageSizeChange(Number(e.target.value))} className="page-size-select">
                {pageSizeOptions.map(size => (<option key={size} value={size}>{size}</option>))}
              </select>
              <span>{t('inventory.item_class_coding.list.per_page')}</span>
            </div>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled={currentPage===1} onClick={()=>handlePageChange(1)} title={t('inventory.item_class_coding.list.first_page')}>
              <ChevronLeft size={14} />
              <ChevronLeft size={14} />
            </button>
            <button className="pagination-btn" disabled={currentPage===1} onClick={()=>handlePageChange(currentPage-1)} title={t('inventory.item_class_coding.list.previous_page')}>
              <ChevronLeft size={14} />
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(7, paginatedItems.last_page || 1) }, (_, index) => {
                let pageNumber; const totalPages = paginatedItems.last_page || 1;
                if (totalPages <= 7) pageNumber = index + 1; else if (currentPage <= 4) pageNumber = index + 1; else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + index; else pageNumber = currentPage - 3 + index;
                return (
                  <button key={pageNumber} className={`pagination-btn ${currentPage===pageNumber?'active':''}`} onClick={()=>handlePageChange(pageNumber)}>
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button className="pagination-btn" disabled={currentPage===(paginatedItems.last_page||1)} onClick={()=>handlePageChange(currentPage+1)} title={t('inventory.item_class_coding.list.next_page')}>
              <ChevronRight size={14} />
            </button>
            <button className="pagination-btn" disabled={currentPage===(paginatedItems.last_page||1)} onClick={()=>handlePageChange(paginatedItems.last_page||1)} title={t('inventory.item_class_coding.list.last_page')}>
              <ChevronRight size={14} />
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="quick-jump">
            <span>{t('inventory.item_class_coding.list.go_to')}</span>
            <input type="number" min="1" max={paginatedItems.last_page || 1} value={currentPage} onChange={(e)=>{ const p=Math.max(1, Math.min(paginatedItems.last_page||1, Number(e.target.value))); handlePageChange(p); }} className="jump-input" />
            <span>of {paginatedItems.last_page || 1}</span>
          </div>
        </div></div>
      </div>
    </App>
  );
}

