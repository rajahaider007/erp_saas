import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { usePermissions } from '../../../hooks/usePermissions';
import { Search, Plus, Edit3, Trash2, Download, ChevronDown, ArrowUpDown, Columns, Clock, MoreHorizontal, RefreshCcw, FileText, CheckCircle2, X, Database, Eye, Copy, ChevronLeft, ChevronRight, User, Shield } from 'lucide-react';

// SweetAlert-like alert
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>' }[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)">${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el); el.querySelector('#o').addEventListener('click',()=>{document.body.removeChild(el); onConfirm&&onConfirm();}); const c=el.querySelector('#c'); c&&c.addEventListener('click',()=>{document.body.removeChild(el); onCancel&&onCancel();});
}};

const USERS_ROUTE = '/system/users';

const List = () => {
  const { users: paginated, companies, locations, departments, flash, filters } = usePage().props;
  const { canAdd, canEdit, canDelete, showPermissionDeniedAlert } = usePermissions();
  const [search, setSearch] = useState(filters?.search || '');
  const [companyId, setCompanyId] = useState(filters?.company_id || '');
  const [locationId, setLocationId] = useState(filters?.location_id || '');
  const [departmentId, setDepartmentId] = useState(filters?.department_id || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get('/system/users?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const applyFilters = useCallback(() => { const params = {}; if (search) params.search = search; if (companyId) params.company_id = companyId; if (locationId) params.location_id = locationId; if (departmentId) params.department_id = departmentId; if (statusFilter) params.status = statusFilter; pushQuery(params); }, [search, companyId, locationId, departmentId, statusFilter]);

  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'created_at', direction: filters?.sort_direction || 'desc' });
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

  const handleDelete = (user) => {
    if (!canDelete(USERS_ROUTE)) { showPermissionDeniedAlert('delete', 'users'); return; }
    CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${user.fname} ${user.lname}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=> router.delete(`/system/users/${user.id}`) });
  };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginated.data.map(u=>u.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => {
  const { t } = useTranslations();
    if (!selected.length) return;
    if (!canDelete(USERS_ROUTE)) { showPermissionDeniedAlert('delete', 'users'); return; }
    CustomAlert.fire({ title:'Delete Selected Users?', text:`You are about to delete ${selected.length} user(s).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=> router.post('/system/users/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]) }) });
  };
  const handleBulkStatusChange = (status) => { if (!selected.length) return; const action = status === 'active' ? 'activate' : status === 'inactive' ? 'deactivate' : `set ${status}`; CustomAlert.fire({ title:`${action.charAt(0).toUpperCase()+action.slice(1)} Selected Users?`, text:`You are about to ${action} ${selected.length} user(s).`, icon:'question', showCancelButton:true, confirmButtonText:`Yes, ${action}!`, onConfirm:()=> router.post('/system/users/bulk-status', { ids:selected, status }, { onSuccess:()=>setSelected([]) }) }); };

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><User className="title-icon" />{usePage().props?.pageTitle || 'Users'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginated?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginated?.data?.filter(u=>u.status === 'active').length || 0} Active</span></div>
                <div className="stat-item"><span>{paginated?.data?.filter(u=>u.status === 'inactive').length || 0} Inactive</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title={t('system.users.list.refresh')}><RefreshCcw size={20} /></button>
              {canAdd(USERS_ROUTE) && (
                <a href='/system/users/create' className="btn btn-primary"><Plus size={20} />{t('system.users.list.add_user')}</a>
              )}
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
                    placeholder={t('system.users.list.search_users')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('system.users.list.company')}</label>
                  <select
                    className="filter-select"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                  >
                    <option value="">{t('system.users.list.all_companies')}</option>
                    {companies?.map(company => (
                      <option key={company.id} value={company.id}>{company.company_name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('system.users.list.location')}</label>
                  <select
                    className="filter-select"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                  >
                    <option value="">{t('system.users.list.all_locations')}</option>
                    {locations?.map(location => (
                      <option key={location.id} value={location.id}>{location.location_name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('system.users.list.department')}</label>
                  <select
                    className="filter-select"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">{t('system.users.list.all_departments')}</option>
                    {departments?.map(department => (
                      <option key={department.id} value={department.id}>{department.department_name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">{t('system.users.list.status')}</label>
                  <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">{t('system.users.list.all_status')}</option>
                    <option value="active">{t('system.users.list.active')}</option>
                    <option value="inactive">{t('system.users.list.inactive')}</option>
                    <option value="suspended">{t('system.users.list.suspended')}</option>
                    <option value="pending">{t('system.users.list.pending')}</option>
                  </select>
                </div>

                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearch('');
                    setCompanyId('');
                    setLocationId('');
                    setDepartmentId('');
                    setStatusFilter('');
                    const params = new URLSearchParams();
                    params.set('page', '1');
                    router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                  }}
                  title={t('system.users.list.reset_all_filters')}
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {selected.length>0 && (<div className="bulk-actions-bar"><div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div><div className="bulk-actions"><button className="btn btn-sm btn-secondary" onClick={()=>{t('system.users.list.setselected')}<X size={16} />{t('system.users.list.clear')}</button><div className="dropdown"><button className="btn btn-sm btn-secondary dropdown-toggle">{t('system.users.list.change_status')}<ChevronDown size={12} /></button><div className="dropdown-menu"><button onClick={()=>{t('system.users.list.handlebulkstatuschangeactiveset_active')}</button><button onClick={()=>{t('system.users.list.handlebulkstatuschangeinactiveset_inacti')}</button><button onClick={()=>{t('system.users.list.handlebulkstatuschangesuspendedset_suspe')}</button><button onClick={()=>{t('system.users.list.handlebulkstatuschangependingset_pending')}</button></div></div>{canDelete(USERS_ROUTE) && <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />{t('system.users.list.delete')}</button>}</div></div>)}

        <div className="data-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===paginated.data.length && paginated.data.length>0} onChange={(e)=>{t('system.users.list.handleselectalletargetchecked_')}</th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{t('system.users.list.id')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{t('system.users.list.user')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{t('system.users.list.contact')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{t('system.users.list.organization')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{t('system.users.list.status')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{t('system.users.list.last_login')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="actions-header">{t('system.users.list.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.data.map(user => (
                  <tr key={user.id} className="table-row">
                    <td><input type="checkbox" className="checkbox" checked={selected.includes(user.id)} onChange={(e)=>{t('system.users.list.handleselectrowuserid_etargetchecked_')}</td>
                    <td><span className="module-id">#{user.id}</span></td>
                    <td>
                      <div className="module-details">
                        <div className="module-name">{user.fname} {user.mname} {user.lname}</div>
                        <div className="module-meta">{user.loginid}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col text-sm">
                        <span>{user.email}</span>
                        {user.phone && <span className="text-gray-500">{user.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col text-sm">
                        {user.company?.company_name && <span className="font-medium">{user.company.company_name}</span>}
                        {user.department?.department_name && <span className="text-gray-500 text-xs">{user.department.department_name}</span>}
                        {user.location?.location_name && <span className="text-gray-500 text-xs">{user.location.location_name}</span>}
                      </div>
                    </td>
                    <td><span className={`status-badge status-${user.status === 'active' ? 'active' : user.status === 'suspended' ? 'error' : user.status === 'pending' ? 'warning' : 'inactive'}`}>{user.status}</span></td>
                    <td>
                      <div className="date-cell">
                        <Clock size={14} />
                        <span>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn view" title={t('system.users.list.view_details')} onClick={()=>router.get(`/system/users/${user.id}`)}>
                          <Eye size={16} />
                        </button>
                        {canEdit(USERS_ROUTE) && (
                          <button className="action-btn edit" title={t('system.users.list.edit_user')} onClick={()=>router.get(`/system/users/${user.id}/edit`)}>
                            <Edit3 size={16} />
                          </button>
                        )}
                        {canEdit(USERS_ROUTE) && (
                          <button className="action-btn rights" title={t('system.users.list.configure_user_rights')} onClick={()=>router.get(`/system/users/${user.id}/rights`)}>
                            <Shield size={16} />
                          </button>
                        )}
                        {canAdd(USERS_ROUTE) && (
                          <button className="action-btn copy" title={t('system.users.list.duplicate')} onClick={()=>router.get('/system/users/create', { duplicate: user.id })}>
                            <Copy size={16} />
                          </button>
                        )}
                        {canDelete(USERS_ROUTE) && (
                          <button className="action-btn delete" title={t('system.users.list.delete_user')} onClick={()=>handleDelete(user)}>
                            <Trash2 size={16} />
                          </button>
                        )}
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
                <span>{t('system.users.list.show')}</span>
                <select value={pageSize} onChange={(e)=>{const v=Number(e.target.value); setPageSize(v); pushQuery({ per_page:v.toString() });}} className="page-size-select">{[10,25,50,100].map(s => (<option key={s} value={s}>{s}</option>))}</select>
                <span>{t('system.users.list.per_page')}</span>
              </div>
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={currentPage===1} onClick={()=>{setCurrentPage(1); pushQuery({ page:'1' });}} title={t('system.users.list.first')}>
                <ChevronLeft size={14} />
                <ChevronLeft size={14} />
              </button>
              <button className="pagination-btn" disabled={currentPage===1} onClick={()=>{const p=currentPage-1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title={t('system.users.list.prev')}>
                <ChevronLeft size={14} />
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(7, paginated.last_page || 1) }, (_, idx) => {
                  let pageNumber; const totalPages = paginated.last_page || 1;
                  if (totalPages <= 7) pageNumber = idx + 1; else if (currentPage <= 4) pageNumber = idx + 1; else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + idx; else pageNumber = currentPage - 3 + idx;
                  return (<button key={pageNumber} className={`pagination-btn ${currentPage===pageNumber?'active':''}`} onClick={()=>{setCurrentPage(pageNumber); pushQuery({ page:pageNumber.toString() });}}>{pageNumber}</button>);
                })}
              </div>
              <button className="pagination-btn" disabled={currentPage===(paginated.last_page||1)} onClick={()=>{const p=currentPage+1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title={t('system.users.list.next')}>
                <ChevronRight size={14} />
              </button>
              <button className="pagination-btn" disabled={currentPage===(paginated.last_page||1)} onClick={()=>{const p=paginated.last_page||1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title={t('system.users.list.last')}>
                <ChevronRight size={14} />
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="quick-jump">
              <span>{t('system.users.list.go_to')}</span>
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
