import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { Search, Plus, Edit3, Trash2, Download, ChevronDown, ArrowUpDown, Columns, Clock, MoreHorizontal, RefreshCcw, FileText, CheckCircle2, X, Database, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

// SweetAlert-like component (same as Modules)
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>'}[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)"> ${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('#o').addEventListener('click', () => { document.body.removeChild(el); onConfirm && onConfirm(); });
  const c = el.querySelector('#c'); c && c.addEventListener('click', () => { document.body.removeChild(el); onCancel && onCancel(); });
}};

export default function List() {
  const { sections: paginatedSections, modules, filters, flash } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [moduleFilter, setModuleFilter] = useState(filters?.module_id || '');
  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'id', direction: filters?.sort_direction || 'desc' });
  const [currentPage, setCurrentPage] = useState(paginatedSections?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const visibleColumnsInit = useMemo(() => ({ id: true, section: true, module: true, status: true, createdAt: false, updatedAt: true, actions: true }), []);
  const [visibleColumns, setVisibleColumns] = useState(visibleColumnsInit);

  useEffect(() => { if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); }, [flash]);

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get(window.location.pathname+'?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const handleSearch = (t) => { setSearchTerm(t); pushQuery({ search:t }); };
  const handleStatusFilter = (s) => { setStatusFilter(s); pushQuery({ status:s }); };
  const handleModuleFilter = (m) => { setModuleFilter(m); pushQuery({ module_id:m }); };
  const handleSort = (key) => { const dir = sortConfig.key===key && sortConfig.direction==='asc'?'desc':'asc'; setSortConfig({ key, direction:dir }); pushQuery({ sort_by:key, sort_direction:dir }); };
  const handlePageChange = (p) => { setCurrentPage(p); pushQuery({ page:p.toString() }); };
  const handlePageSizeChange = (s) => { setPageSize(s); pushQuery({ per_page:s.toString() }); };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginatedSections.data.map(s=>s.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSeltttttttected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Sections?', text:`You are about to delete ${selected.length} section(s).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=>{ setLoading(true); router.post('/system/sections/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]), onFinish:()=>setLoading(false) }); } }); };
  const handleBulkStatusChange = (newStatus) => { if (!selected.length) return; const action = newStatus?'activate':'deactivate'; CustomAlert.fire({ title:`${action.charAt(0).toUpperCase()+action.slice(1)} Selected Sections?`, text:`You are about to ${action} ${selected.length} section(s).`, icon:'question', showCancelButton:true, confirmButtonText:`Yes, ${action}!`, onConfirm:()=>{ setLoading(true); router.post('/system/sections/bulk-status', { ids:selected, status:newStatus }, { onSuccess:()=>setSelected([]), onFinish:()=>setLoading(false) }); } }); };
  const exportToCSV = () => { CustomAlert.fire({ title:'Export to CSV', text:'Download all sections as CSV file?', icon:'question', showCancelButton:true, confirmButtonText:'Yes, download!', onConfirm:()=> window.open('/system/sections/export-csv','_blank') }); };
  const handleDelete = (section) => { CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${section.section_name}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=>{ setLoading(true); router.delete(`/system/sections/${section.id}`, { onFinish:()=>setLoading(false) }); } }); };

  const statusOptions = [ { value:'all', label:'All Status' }, { value:'1', label:'Active' }, { value:'0', label:'Inactive' } ];
  const pageSizeOptions = [10,25,50,100];

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Database className="title-icon" />{usePage().props?.pageTitle || 'Sections'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginatedSections?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginatedSections?.data?.filter(s=>s.status).length || 0} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title="Refresh" disabled={loading}><RefreshCcw size={20} className={loading ? 'animate-spin' : ''} /></button>
              <div className="dropdown"><button className="btn btn-secondary dropdown-toggle"><Download size={20} />Export<ChevronDown size={16} /></button><div className="dropdown-menu"><button onClick={exportToCSV}><FileText size={16} />Export as CSV</button></div></div>
              <a href='/system/sections/create' className="btn btn-primary"><Plus size={20} />Add Section</a>
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              <div className="search-container"><Search className="search-icon" size={20} /><input type="text" className="search-input" placeholder="Search sections..." value={searchTerm} onChange={(e)=>handleSearch(e.target.value)} /></div>
              <select className="filter-select" value={statusFilter} onChange={(e)=>handleStatusFilter(e.target.value)}>{statusOptions.map(o=>(<option key={o.value} value={o.value}>{o.label}</option>))}</select>
              <select className="filter-select" value={moduleFilter} onChange={(e)=>handleModuleFilter(e.target.value)}>
                <option value="">All Modules</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.module_name}</option>)}
              </select>
            </div>
            <div className="view-controls"><button className="btn btn-icon" onClick={()=>setShowColumnSelector(!showColumnSelector)} title="Show/Hide Columns"><Columns size={20} /></button></div>
          </div>
          {showColumnSelector && (<div className="column-selector"><div className="column-selector-content"><h3>Show/Hide Columns</h3><div className="column-grid">{Object.entries(visibleColumns).map(([key, visible]) => (key!=='actions' && (<label key={key} className="column-item"><input type="checkbox" checked={visible} onChange={(e)=>setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} /><span>{key.replace(/([A-Z])/g,' $1').replace(/^./, s=>s.toUpperCase())}</span></label>)))}
          </div><button className="btn btn-sm btn-secondary" onClick={()=>setShowColumnSelector(false)}>Close</button></div></div>)}
        </div>
        {selected.length>0 && (<div className="bulk-actions-bar"><div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div><div className="bulk-actions"><button className="btn btn-sm btn-secondary" onClick={()=>setSelected([])}><X size={16} />Clear</button><div className="dropdown"><button className="btn btn-sm btn-secondary dropdown-toggle">Change Status<ChevronDown size={12} /></button><div className="dropdown-menu"><button onClick={()=>handleBulkStatusChange(true)}>Set Active</button><button onClick={()=>handleBulkStatusChange(false)}>Set Inactive</button></div></div><button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />Delete</button></div></div>)}
        <div className="data-table-container"><div className="table-wrapper"><table className="data-table"><thead><tr>
          <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===paginatedSections.data.length && paginatedSections.data.length>0} onChange={(e)=>handleSelectAll(e.target.checked)} /></th>
          {visibleColumns.id && (<th className="sortable" onClick={()=>handleSort('id')}><div className="th-content">ID<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='id'?'active':''}`} /></div></th>)}
          {visibleColumns.section && (<th className="sortable" onClick={()=>handleSort('section_name')}><div className="th-content">Section<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='section_name'?'active':''}`} /></div></th>)}
          {visibleColumns.module && (<th><div className="th-content">Module</div></th>)}
          {visibleColumns.status && (<th className="sortable" onClick={()=>handleSort('status')}><div className="th-content">Status<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='status'?'active':''}`} /></div></th>)}
          {visibleColumns.createdAt && (<th className="sortable" onClick={()=>handleSort('created_at')}><div className="th-content">Created<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='created_at'?'active':''}`} /></div></th>)}
          {visibleColumns.updatedAt && (<th className="sortable" onClick={()=>handleSort('updated_at')}><div className="th-content">Updated<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='updated_at'?'active':''}`} /></div></th>)}
          {visibleColumns.actions && (<th className="actions-header">Actions</th>)}
        </tr></thead><tbody>
          {paginatedSections.data.map((s) => (
            <tr key={s.id} className="table-row">
              <td><input type="checkbox" className="checkbox" checked={selected.includes(s.id)} onChange={(e)=>handleSelectRow(s.id, e.target.checked)} /></td>
              {visibleColumns.id && (<td><span className="module-id">#{s.id}</span></td>)}
              {visibleColumns.section && (<td><div className="module-details"><div className="module-name">{s.section_name}</div></div></td>)}
              {visibleColumns.module && (<td>{s.module?.module_name}</td>)}
              {visibleColumns.status && (<td><span className={`status-badge status-${s.status ? 'active' : 'inactive'}`}>{s.status ? 'Active' : 'Inactive'}</span></td>)}
              {visibleColumns.createdAt && (<td><div className="date-cell"><Clock size={14} /><span>{new Date(s.created_at).toLocaleString()}</span></div></td>)}
              {visibleColumns.updatedAt && (<td><div className="date-cell"><Clock size={14} /><span>{new Date(s.updated_at).toLocaleString()}</span></div></td>)}
              {visibleColumns.actions && (
                <td>
                  <div className="actions-cell">
                    <button className="action-btn view" title="View Details" onClick={() => router.get(`/system/sections/${s.id}/edit`)}>
                      <Eye size={16} />
                    </button>
                    <button className="action-btn edit" title="Edit Section" onClick={() => router.get(`/system/sections/${s.id}/edit`)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="action-btn copy" title="Duplicate" onClick={() => router.get('/system/sections/create', { duplicate: s.id })}>
                      <Copy size={16} />
                    </button>
                    <button className="action-btn delete" title="Delete Section" onClick={() => handleDelete(s)}>
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
            <div className="results-info">Showing {paginatedSections.from || 0} to {paginatedSections.to || 0} of {paginatedSections.total || 0} entries</div>
            <div className="page-size-selector">
              <span>Show:</span>
              <select value={pageSize} onChange={(e)=>handlePageSizeChange(Number(e.target.value))} className="page-size-select">
                {pageSizeOptions.map(size => (<option key={size} value={size}>{size}</option>))}
              </select>
              <span>per page</span>
            </div>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled={currentPage===1} onClick={()=>handlePageChange(1)} title="First Page">
              <ChevronLeft size={14} />
              <ChevronLeft size={14} />
            </button>
            <button className="pagination-btn" disabled={currentPage===1} onClick={()=>handlePageChange(currentPage-1)} title="Previous Page">
              <ChevronLeft size={14} />
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(7, paginatedSections.last_page || 1) }, (_, index) => {
                let pageNumber; const totalPages = paginatedSections.last_page || 1;
                if (totalPages <= 7) pageNumber = index + 1; else if (currentPage <= 4) pageNumber = index + 1; else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + index; else pageNumber = currentPage - 3 + index;
                return (
                  <button key={pageNumber} className={`pagination-btn ${currentPage===pageNumber?'active':''}`} onClick={()=>handlePageChange(pageNumber)}>
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button className="pagination-btn" disabled={currentPage===(paginatedSections.last_page||1)} onClick={()=>handlePageChange(currentPage+1)} title="Next Page">
              <ChevronRight size={14} />
            </button>
            <button className="pagination-btn" disabled={currentPage===(paginatedSections.last_page||1)} onClick={()=>handlePageChange(paginatedSections.last_page||1)} title="Last Page">
              <ChevronRight size={14} />
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="quick-jump">
            <span>Go to:</span>
            <input type="number" min="1" max={paginatedSections.last_page || 1} value={currentPage} onChange={(e)=>{ const p=Math.max(1, Math.min(paginatedSections.last_page||1, Number(e.target.value))); handlePageChange(p); }} className="jump-input" />
            <span>of {paginatedSections.last_page || 1}</span>
          </div>
        </div></div>
      </div>
    </App>
  );
}


