import React, { useCallback, useEffect, useMemo, useState } from 'react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { Search, Plus, Edit3, Trash2, ChevronDown, ArrowUpDown, Clock, RefreshCcw, CheckCircle2, X, ChevronLeft, ChevronRight, Package } from 'lucide-react';

// SweetAlert-like alert
const CustomAlert = { fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
  const el = document.createElement('div'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const iconHtml = { success:'<div style="color:#10B981;font-size:48px;">✓</div>', error:'<div style="color:#EF4444;font-size:48px;">✗</div>', warning:'<div style="color:#F59E0B;font-size:48px;">⚠</div>', question:'<div style="color:#3B82F6;font-size:48px;">?</div>' }[icon]||'';
  el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)">${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton?`<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>`:''}<button id='o' style='background:${icon==='error'||icon==='warning'?'#EF4444':'#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${confirmButtonText}</button></div></div>`;
  document.body.appendChild(el); el.querySelector('#o').addEventListener('click',()=>{document.body.removeChild(el); onConfirm&&onConfirm();}); const c=el.querySelector('#c'); c&&c.addEventListener('click',()=>{document.body.removeChild(el); onCancel&&onCancel();});
}};

const List = () => {
  const { t } = useTranslations();
  const tl = (key, rep) => (rep ? t(`system.package_features.list.${key}`, rep) : t(`system.package_features.list.${key}`));
  const td = (key, rep) => (rep ? t(`common.data_table.${key}`, rep) : t(`common.data_table.${key}`));
  const { packageFeatures: paginated, packages, flash, filters } = usePage().props;
  const [search, setSearch] = useState(filters?.search || '');
  const [packageId, setPackageId] = useState(filters?.package_id || '');

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get('/system/package-features?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const applyFilters = useCallback(() => { const params = {}; if (search) params.search = search; if (packageId) params.package_id = packageId; pushQuery(params); }, [search, packageId]);

  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'package_id', direction: filters?.sort_direction || 'asc' });
  const [currentPage, setCurrentPage] = useState(paginated?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const groupedFeatures = useMemo(() => {
    const unknown = t('system.package_features.list.unknown_package');
    const groups = {};
    paginated.data.forEach(pf => {
      const packageName = pf.package?.package_name || unknown;
      if (!groups[packageName]) {
        groups[packageName] = {
          package: pf.package,
          features: [],
          totalFeatures: 0,
          enabledFeatures: 0,
          created_at: pf.created_at
        };
      }
      groups[packageName].features.push(pf);
      groups[packageName].totalFeatures++;
      if (pf.is_enabled) groups[packageName].enabledFeatures++;
    });
    return Object.values(groups);
  }, [paginated.data, t]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    if (flash?.success) CustomAlert.fire({ title: t('common.flash.success_title'), text: flash.success, icon: 'success' });
    else if (flash?.error) CustomAlert.fire({ title: t('common.flash.error_title'), text: flash.error, icon: 'error' });
  }, [flash, t]);

  const handleDelete = (group) => {
    CustomAlert.fire({
      title: td('confirm_delete_title'),
      text: tl('confirm_delete_all_for_package', { name: group.package.package_name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: td('confirm_delete_ok'),
      cancelButtonText: t('common.actions.cancel'),
      onConfirm: () => {
        const featureIds = group.features.map(f => f.id);
        router.post('/system/package-features/bulk-destroy', { ids: featureIds });
      },
    });
  };

  const handleSelectAll = (checked) => { if (checked) setSelected(groupedFeatures.map(g=>g.package.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => {
    if (!selected.length) return;
    CustomAlert.fire({
      title: td('bulk_delete_title'),
      text: td('bulk_delete_text', { count: selected.length }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: td('bulk_delete_ok'),
      cancelButtonText: t('common.actions.cancel'),
      onConfirm: () => router.post('/system/package-features/bulk-destroy', { ids: selected }, { onSuccess: () => setSelected([]) }),
    });
  };

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Package className="title-icon" />{usePage().props?.pageTitle || t('system.package_features.add.package_features')}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{tl('stat_packages', { count: groupedFeatures.length })}</span></div>
                <div className="stat-item"><span>{tl('stat_total_features', { count: paginated?.total || 0 })}</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title={tl('refresh')}><RefreshCcw size={20} /></button>
              <a href='/system/package-features/create' className="btn btn-primary"><Plus size={20} />{tl('add_package_features')}</a>
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
                    placeholder={tl('search_package_features')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">{tl('package')}</label>
                  <select
                    className="filter-select"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                  >
                    <option value="">{tl('all_packages')}</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.package_name}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="reset-btn"
                  onClick={() => {
                    setSearch('');
                    setPackageId('');
                    const params = new URLSearchParams();
                    params.set('page', '1');
                    router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                  }}
                  title={tl('reset_all_filters')}
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {selected.length>0 && (<div className="bulk-actions-bar"><div className="selection-info"><CheckCircle2 size={20} /><span>{td('selected_count', { count: selected.length })}</span></div><div className="bulk-actions"><button className="btn btn-sm btn-secondary" onClick={()=>setSelected([])}><X size={16} />{tl('clear')}</button><button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />{tl('delete')}</button></div></div>)}

        <div className="data-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===groupedFeatures.length && groupedFeatures.length>0} onChange={(e)=>handleSelectAll(e.target.checked)} /></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{tl('package')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{tl('features')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{tl('enabled')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="sortable" onClick={()=>{}}><div className="th-content">{tl('created')}<ArrowUpDown size={14} className="sort-icon" /></div></th>
                  <th className="actions-header">{tl('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {groupedFeatures.map(group => (
                  <tr key={group.package.id} className="table-row">
                    <td><input type="checkbox" className="checkbox" checked={selected.includes(group.package.id)} onChange={(e)=>handleSelectRow(group.package.id, e.target.checked)} /></td>
                    <td><div className="module-details"><div className="module-name">{group.package.package_name}</div></div></td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{tl('features_count', { count: group.totalFeatures })}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {group.features.slice(0, 3).map(feature => (
                            <span key={feature.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {feature.menu?.menu_name}
                            </span>
                          ))}
                          {group.features.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tl('more_features', { count: group.features.length - 3 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`status-badge status-${group.enabledFeatures > 0 ? 'active' : 'inactive'}`}>
                          {group.enabledFeatures}/{group.totalFeatures}
                        </span>
                        <span className="text-xs text-gray-500">{tl('enabled_lowercase')}</span>
                      </div>
                    </td>
                    <td><div className="date-cell"><Clock size={14} /><span>{new Date(group.created_at).toLocaleString()}</span></div></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" title={tl('edit_package_features')} onClick={()=>router.get(`/system/package-features/${group.package.id}/edit`)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="action-btn delete" title={tl('delete_all_package_features')} onClick={()=>handleDelete(group)}>
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
              <div className="results-info">{td('showing_entries', { from: paginated.from || 0, to: paginated.to || 0, total: paginated.total || 0 })}</div>
              <div className="page-size-selector">
                <span>{tl('show')}</span>
                <select value={pageSize} onChange={(e)=>{const v=Number(e.target.value); setPageSize(v); pushQuery({ per_page:v.toString() });}} className="page-size-select">{[10,25,50,100].map(s => (<option key={s} value={s}>{s}</option>))}</select>
                <span>{tl('per_page')}</span>
              </div>
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled={currentPage===1} onClick={()=>{setCurrentPage(1); pushQuery({ page:'1' });}} title={tl('first')}>
                <ChevronLeft size={14} />
                <ChevronLeft size={14} />
              </button>
              <button className="pagination-btn" disabled={currentPage===1} onClick={()=>{const p=currentPage-1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title={tl('prev')}>
                <ChevronLeft size={14} />
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(7, paginated.last_page || 1) }, (_, idx) => {
                  let pageNumber; const totalPages = paginated.last_page || 1;
                  if (totalPages <= 7) pageNumber = idx + 1; else if (currentPage <= 4) pageNumber = idx + 1; else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + idx; else pageNumber = currentPage - 3 + idx;
                  return (<button key={pageNumber} className={`pagination-btn ${currentPage===pageNumber?'active':''}`} onClick={()=>{setCurrentPage(pageNumber); pushQuery({ page:pageNumber.toString() });}}>{pageNumber}</button>);
                })}
              </div>
              <button className="pagination-btn" disabled={currentPage===(paginated.last_page||1)} onClick={()=>{const p=currentPage+1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title={tl('next')}>
                <ChevronRight size={14} />
              </button>
              <button className="pagination-btn" disabled={currentPage===(paginated.last_page||1)} onClick={()=>{const p=paginated.last_page||1; setCurrentPage(p); pushQuery({ page:p.toString() });}} title={tl('last')}>
                <ChevronRight size={14} />
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="quick-jump">
              <span>{tl('go_to')}</span>
              <input
                type="number"
                min="1"
                max={paginated.last_page || 1}
                value={currentPage}
                onChange={(e)=>{ const p = Math.max(1, Math.min(paginated.last_page || 1, Number(e.target.value))); setCurrentPage(p); pushQuery({ page:p.toString() }); }}
                className="jump-input"
              />
              <span>{td('pagination_of', { total: paginated.last_page || 1 })}</span>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default List;
