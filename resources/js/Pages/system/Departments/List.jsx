import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { Search, Plus, Edit3, Trash2, Download, ChevronDown, ArrowUpDown, Columns, Clock, MoreHorizontal, RefreshCcw, FileText, CheckCircle2, X, Database, Eye, Copy, ChevronLeft, ChevronRight, Users } from 'lucide-react';

// SweetAlert-like alert
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>' }[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)">${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el); el.querySelector('#o').addEventListener('click',()=>{document.body.removeChild(el); onConfirm&&onConfirm();}); const c=el.querySelector('#c'); c&&c.addEventListener('click',()=>{document.body.removeChild(el); onCancel&&onCancel();});
}};

const List = () => {
  const { departments: paginated, companies, locations, flash, filters } = usePage().props;
  const [search, setSearch] = useState(filters?.search || '');
  const [companyId, setCompanyId] = useState(filters?.company_id || '');
  const [locationId, setLocationId] = useState(filters?.location_id || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get('/system/departments?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const applyFilters = useCallback(() => { const params = {}; if (search) params.search = search; if (companyId) params.company_id = companyId; if (locationId) params.location_id = locationId; if (statusFilter) params.status = statusFilter; pushQuery(params); }, [search, companyId, locationId, statusFilter]);

  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'sort_order', direction: filters?.sort_direction || 'asc' });
  const [currentPage, setCurrentPage] = useState(paginated?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); 
    else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); 
  }, [flash]);

  const handleDelete = (department) => { CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${department.department_name}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=> router.delete(`/system/departments/${department.id}`) }); };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginated.data.map(d=>d.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Departments?', text:`You are about to delete ${selected.length} department(s).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=> router.post('/system/departments/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]) }) }); };
  const handleBulkStatusChange = (status) => { if (!selected.length) return; const action = status?'activate':'deactivate'; CustomAlert.fire({ title:`${action.charAt(0).toUpperCase()+action.slice(1)} Selected Departments?`, text:`You are about to ${action} ${selected.length} department(s).`, icon:'question', showCancelButton:true, confirmButtonText:`Yes, ${action}!`, onConfirm:()=> router.post('/system/departments/bulk-status', { ids:selected, status }, { onSuccess:()=>setSelected([]) }) }); };

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Users className="title-icon" />{usePage().props?.pageTitle || 'Departments'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginated?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginated?.data?.filter(d=>d.status).length || 0} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title="Refresh"><RefreshCcw size={20} /></button>
              <a href='/system/departments/create' className="btn btn-primary"><Plus size={20} />Add Department</a>
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
                    placeholder="Search departments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Company</label>
                  <select
                    className="filter-select"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                  >
                    <option value="">All Companies</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Location</label>
                  <select
                    className="filter-select"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.location_name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearch('');
                    setCompanyId('');
                    setLocationId('');
                    setStatusFilter('');
                    const params = new URLSearchParams();
                    params.set('page', '1');
                    router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                  }}
                  title="Reset all filters"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
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
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Department<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Company<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Location<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Manager<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Status<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">Updated<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.data.map(department => (
                  <tr key={department.id} className="table-row">
                    <td><input type="checkbox" className="checkbox" checked={selected.includes(department.id)} onChange={(e)=>handleSelectRow(department.id, e.target.checked)} /></td>
                    <td><span className="module-id">#{department.id}</span></td>
                    <td><div className="module-details"><div className="module-name">{department.department_name}</div></div></td>
                    <td>{department.company?.company_name}</td>
                    <td>{department.location?.location_name}</td>
                    <td>
                      <div className="flex flex-col text-sm">
                        {department.manager_name && <span className="font-medium">{department.manager_name}</span>}
                        {department.manager_email && <span className="text-gray-500 text-xs">{department.manager_email}</span>}
                      </div>
                    </td>
                    <td><span className={`status-badge status-${department.status ? 'active' : 'inactive'}`}>{department.status ? 'Active' : 'Inactive'}</span></td>
                    <td><div className="date-cell"><Clock size={14} /><span>{new Date(department.updated_at).toLocaleString()}</span></div></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn view" title="View Details" onClick={()=>router.get(`/system/departments/${department.id}/edit`)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn edit" title="Edit Department" onClick={()=>router.get(`/system/departments/${department.id}/edit`)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="action-btn copy" title="Duplicate" onClick={()=>router.get('/system/departments/create', { duplicate: department.id })}>
                          <Copy size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Department" onClick={()=>handleDelete(department)}>
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
