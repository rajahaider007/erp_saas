import React, { useCallback, useEffect, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { Search, Plus, Edit3, Trash2, RefreshCcw, ChevronLeft, ChevronRight, Code, Clock, X, CheckCircle2, ArrowUpDown, Building2, MapPin } from 'lucide-react';

// SweetAlert-like alert
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>' }[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)">${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el); el.querySelector('#o').addEventListener('click',()=>{document.body.removeChild(el); onConfirm&&onConfirm();}); const c=el.querySelector('#c'); c&&c.addEventListener('click',()=>{document.body.removeChild(el); onCancel&&onCancel();});
}};

const Index = () => {
  const { configurations: paginated, companies, locations, codeTypes, flash, filters } = usePage().props;
  const [search, setSearch] = useState(filters?.search || '');
  const [companyFilter, setCompanyFilter] = useState(filters?.company_id || '');
  const [locationFilter, setLocationFilter] = useState(filters?.location_id || '');
  const [codeTypeFilter, setCodeTypeFilter] = useState(filters?.code_type || '');
  const [statusFilter, setStatusFilter] = useState(filters?.is_active || '');

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get('/system/code-configurations?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  
  const applyFilters = useCallback(() => { 
    const params = {}; 
    if (search) params.search = search; 
    if (companyFilter) params.company_id = companyFilter; 
    if (locationFilter) params.location_id = locationFilter;
    if (codeTypeFilter) params.code_type = codeTypeFilter;
    if (statusFilter) params.is_active = statusFilter; 
    pushQuery(params); 
  }, [search, companyFilter, locationFilter, codeTypeFilter, statusFilter]);

  const [currentPage, setCurrentPage] = useState(paginated?.current_page || 1);
  const [pageSize, setPageSize] = useState(15);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); 
    else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); 
  }, [flash]);

  const handleDelete = (config) => { 
    CustomAlert.fire({ 
      title:'Are you sure?', 
      text:`You are about to delete "${config.code_name}". This action cannot be undone!`, 
      icon:'warning', 
      showCancelButton:true, 
      confirmButtonText:'Yes, delete it!', 
      cancelButtonText:'Cancel', 
      onConfirm:()=> router.delete(`/system/code-configurations/${config.id}`) 
    }); 
  };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginated.data.map(c=>c.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Code className="title-icon" />Code Configuration</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginated?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginated?.data?.filter(c=>c.is_active).length || 0} Active</span></div>
                <div className="stat-item"><span>{paginated?.data?.filter(c=>!c.is_active).length || 0} Inactive</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title="Refresh"><RefreshCcw size={20} /></button>
              <a href='/system/code-configurations/create' className="btn btn-primary"><Plus size={20} />Add Configuration</a>
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
                    placeholder="Search by name, type, prefix..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Company</label>
                  <select
                    className="filter-select"
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                  >
                    <option value="">All Companies</option>
                    {companies?.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Location</label>
                  <select
                    className="filter-select"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations?.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Code Type</label>
                  <select
                    className="filter-select"
                    value={codeTypeFilter}
                    onChange={(e) => setCodeTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {codeTypes?.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
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
                    setCompanyFilter('');
                    setLocationFilter('');
                    setCodeTypeFilter('');
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

        {selected.length>0 && (
          <div className="bulk-actions-bar">
            <div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div>
            <div className="bulk-actions">
              <button className="btn btn-sm btn-secondary" onClick={()=>setSelected([])}><X size={16} />Clear</button>
            </div>
          </div>
        )}

        <div className="data-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===paginated.data.length && paginated.data.length>0} onChange={(e)=>handleSelectAll(e.target.checked)} /></th>
                  <th className="sortable"><div className="th-content">ID<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Code Type<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Code Name<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Company<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Location<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Format<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Level<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Next #<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable"><div className="th-content">Status<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.data.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem' }}>
                      <div style={{ color: '#9CA3AF', fontSize: '1rem' }}>
                        <Code size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No code configurations found</p>
                        <p style={{ fontSize: '0.875rem' }}>Create your first code configuration to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.data.map(config => (
                    <tr key={config.id} className="table-row">
                      <td><input type="checkbox" className="checkbox" checked={selected.includes(config.id)} onChange={(e)=>handleSelectRow(config.id, e.target.checked)} /></td>
                      <td><span className="module-id">#{config.id}</span></td>
                      <td>
                        <div className="module-details">
                          <div className="module-name capitalize">{config.code_type.replace('_', ' ')}</div>
                        </div>
                      </td>
                      <td><span className="text-sm font-medium">{config.code_name}</span></td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 size={14} className="text-gray-400" />
                          <span>{config.company ? config.company.company_name : 'All Companies'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{config.location ? config.location.location_name : 'All Locations'}</span>
                        </div>
                      </td>
                      <td>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {config.prefix || ''}{config.prefix ? config.separator : ''}{'0'.repeat(config.number_length)}
                        </code>
                      </td>
                      <td><span className="text-sm">Level {config.account_level}</span></td>
                      <td><span className="text-sm font-semibold text-blue-600">{config.next_number}</span></td>
                      <td><span className={`status-badge status-${config.is_active ? 'active' : 'inactive'}`}>{config.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="actions-cell">
                          <button className="action-btn edit" title="Edit Configuration" onClick={()=>router.get(`/system/code-configurations/${config.id}/edit`)}>
                            <Edit3 size={16} />
                          </button>
                          <button className="action-btn delete" title="Delete Configuration" onClick={()=>handleDelete(config)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <div className="pagination-info">
              <div className="results-info">Showing {paginated.from || 0} to {paginated.to || 0} of {paginated.total || 0} entries</div>
              <div className="page-size-selector">
                <span>Show:</span>
                <select value={pageSize} onChange={(e)=>{const v=Number(e.target.value); setPageSize(v); pushQuery({ per_page:v.toString() });}} className="page-size-select">{[10,15,25,50].map(s => (<option key={s} value={s}>{s}</option>))}</select>
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
          </div>
        </div>
      </div>
    </App>
  );
};

export default Index;
