import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { Search, Plus, Edit3, Trash2, Download, ChevronDown, ArrowUpDown, Columns, Clock, MoreHorizontal, RefreshCcw, FileText, CheckCircle2, X, Database, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

// SweetAlert-like alert
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>' }[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)">${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el); el.querySelector('#o').addEventListener('click',()=>{document.body.removeChild(el); onConfirm&&onConfirm();}); const c=el.querySelector('#c'); c&&c.addEventListener('click',()=>{document.body.removeChild(el); onCancel&&onCancel();});
}};

const List = () => {
  const { menus: paginated, modules, flash, filters } = usePage().props;
  const [search, setSearch] = useState(filters?.search || '');
  const [moduleId, setModuleId] = useState(filters?.module_id || '');
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(filters?.section_id || '');

  useEffect(() => {
    if (!moduleId) { setSections([]); setSectionId(''); return; }
    fetch(`/system/sections/by-module/${moduleId}`)
      .then(r => r.json())
      .then(res => setSections(res?.data?.sections || []))
      .catch(() => setSections([]));
  }, [moduleId]);

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get('/system/menus?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const applyFilters = useCallback(() => { const params = {}; if (search) params.search = search; if (moduleId) params.module_id = moduleId; if (sectionId) params.section_id = sectionId; pushQuery(params); }, [search, moduleId, sectionId]);

  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'id', direction: filters?.sort_direction || 'desc' });
  const [currentPage, setCurrentPage] = useState(paginated?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const handleDelete = (menu) => { CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${menu.menu_name}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=> router.delete(`/system/menus/${menu.id}`) }); };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginated.data.map(m=>m.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Menus?', text:`You are about to delete ${selected.length} menu(s).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=> router.post('/system/menus/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]) }) }); };
  const handleBulkStatusChange = (status) => { if (!selected.length) return; const action = status?'activate':'deactivate'; CustomAlert.fire({ title:`${action.charAt(0).toUpperCase()+action.slice(1)} Selected Menus?`, text:`You are about to ${action} ${selected.length} menu(s).`, icon:'question', showCancelButton:true, confirmButtonText:`Yes, ${action}!`, onConfirm:()=> router.post('/system/menus/bulk-status', { ids:selected, status }, { onSuccess:()=>setSelected([]) }) }); };
  const exportToCSV = () => { CustomAlert.fire({ title:'Export to CSV', text:'Download all menus as CSV file?', icon:'question', showCancelButton:true, confirmButtonText:'Yes, download!', onConfirm:()=> window.open('/system/menus/export-csv','_blank') }); };

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Database className="title-icon" />{usePage().props?.pageTitle || 'Menus'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginated?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginated?.data?.filter(m=>m.status).length || 0} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title="Refresh"><RefreshCcw size={20} /></button>
              <div className="dropdown"><button className="btn btn-secondary dropdown-toggle"><Download size={20} />Export<ChevronDown size={16} /></button><div className="dropdown-menu"><button onClick={exportToCSV}><FileText size={16} />Export as CSV</button></div></div>
              <a href='/system/menus/create' className="btn btn-primary"><Plus size={20} />Add Menu</a>
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              <div className="search-container"><Search className="search-icon" size={20} /><input type="text" className="search-input" placeholder="Search menus..." value={search} onChange={(e)=>setSearch(e.target.value)} /></div>
              <select className="filter-select" value={moduleId} onChange={(e)=>setModuleId(e.target.value)}><option value="">All Modules</option>{modules.map(m => <option key={m.id} value={m.id}>{m.module_name}</option>)}</select>
              <select className="filter-select" value={sectionId} onChange={(e)=>setSectionId(e.target.value)} disabled={!sections.length}><option value="">All Sections</option>{sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}</select>
            </div>
            <div className="view-controls"><button className="btn btn-icon" onClick={()=>setShowColumnSelector(!showColumnSelector)} title="Show/Hide Columns"><Columns size={20} /></button></div>
          </div>
        </div>

        {selected.length>0 && (<div className="bulk-actions-bar"><div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div><div className="bulk-actions"><button className="btn btn-sm btn-secondary" onClick={()=>setSelected([])}><X size={16} />Clear</button><div className="dropdown"><button className="btn btn-sm btn-secondary dropdown-toggle">Change Status<ChevronDown size={12} /></button><div className="dropdown-menu"><button onClick={()=>handleBulkStatusChange(true)}>Set Active</button><button onClick={()=>handleBulkStatusChange(false)}>Set Inactive</button></div></div><button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />Delete</button></div></div>)}

        <div className="data-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===paginated.data.length && paginated.data.length>0} onChange={(e)=>handleSelectAll(e.target.checked)} /></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">ID<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Menu<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th><div className="th-content">Module</div></th>
                  <th><div className="th-content">Section</div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Status<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Updated<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.data.map(m => (
                  <tr key={m.id} className="table-row">
                    <td><input type="checkbox" className="checkbox" checked={selected.includes(m.id)} onChange={(e)=>handleSelectRow(m.id, e.target.checked)} /></td>
                    <td><span className="module-id">#{m.id}</span></td>
                    <td><div className="module-details"><div className="module-name">{m.menu_name}</div></div></td>
                    <td>{m.module?.module_name}</td>
                    <td>{m.section?.section_name}</td>
                    <td><span className={`status-badge status-${m.status ? 'active' : 'inactive'}`}>{m.status ? 'Active' : 'Inactive'}</span></td>
                    <td><div className="date-cell"><Clock size={14} /><span>{new Date(m.updated_at).toLocaleString()}</span></div></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn view" title="View Details" onClick={()=>router.get(`/system/menus/${m.id}/edit`)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn edit" title="Edit Menu" onClick={()=>router.get(`/system/menus/${m.id}/edit`)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="action-btn copy" title="Duplicate" onClick={()=>router.get('/system/menus/create', { duplicate: m.id })}>
                          <Copy size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Menu" onClick={()=>handleDelete(m)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="pagination-info">
              <div className="results-info">Showing {paginated.from || 0} to {paginated.to || 0} of {paginated.total || 0} entries</div>
              <div className="page-size-selector">
                <span>Show:</span>
                <select value={pageSize} onChange={(e)=>{const v=Number(e.target.value); setPageSize(v); pushQuery({ per_page:v.toString() });}} className="page-size-select">{[10,25,50,100].map(s => (<option key={s} value={s}>{s}</option>))}</select>
                <span>per page</span>
              </div>
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={currentPage===1} onClick={()=>{setCurrentPage(1); pushQuery({ page:'1' });}} title="First">
                <ChevronLeft size={14} />
                <ChevronLeft size={14} />
              </button>
              <button className="pagination-btn" disabled={currentPage===1} onClick={()=>{const p=currentPage-1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title="Prev">
                <ChevronLeft size={14} />
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(7, paginated.last_page || 1) }, (_, idx) => {
                  let pageNumber; const totalPages = paginated.last_page || 1;
                  if (totalPages <= 7) pageNumber = idx + 1; else if (currentPage <= 4) pageNumber = idx + 1; else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + idx; else pageNumber = currentPage - 3 + idx;
                  return (<button key={pageNumber} className={`pagination-btn ${currentPage===pageNumber?'active':''}`} onClick={()=>{setCurrentPage(pageNumber); pushQuery({ page:pageNumber.toString() });}}>{pageNumber}</button>);
                })}
              </div>
              <button className="pagination-btn" disabled={currentPage===(paginated.last_page||1)} onClick={()=>{const p=currentPage+1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title="Next">
                <ChevronRight size={14} />
              </button>
              <button className="pagination-btn" disabled={currentPage===(paginated.last_page||1)} onClick={()=>{const p=paginated.last_page||1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title="Last">
                <ChevronRight size={14} />
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="quick-jump">
              <span>Go to:</span>
              <input
                type="number"
                min="1"
                max={paginated.last_page || 1}
                value={currentPage}
                onChange={(e)=>{ const p = Math.max(1, Math.min(paginated.last_page || 1, Number(e.target.value))); setCurrentPage(p); pushQuery({ page:p.toString() }); }}
                className="jump-input"
              />
              <span>of {paginated.last_page || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default List;


