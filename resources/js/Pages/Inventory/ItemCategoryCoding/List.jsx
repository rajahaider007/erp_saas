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
  const { categories: paginatedCategories, filters, flash } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [sortConfig, setSortConfig] = useState({ key: filters?.sort_by || 'category_code', direction: filters?.sort_direction || 'asc' });
  const [currentPage, setCurrentPage] = useState(paginatedCategories?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selected, setSelected] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const visibleColumnsInit = useMemo(() => ({ id: true, categoryCode: true, categoryName: true, inventoryType: true, status: true, updatedAt: true, actions: true }), []);
  const [visibleColumns, setVisibleColumns] = useState(visibleColumnsInit);

  useEffect(() => { if (flash?.success) CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' }); else if (flash?.error) CustomAlert.fire({ title:'Error!', text: flash.error, icon: 'error' }); }, [flash]);

  const pushQuery = (obj) => { const params = new URLSearchParams(window.location.search); Object.entries(obj).forEach(([k,v])=>{ if(v===undefined||v===null||v===''||v==='all') params.delete(k); else params.set(k,v); }); if(!obj.page) params.set('page','1'); router.get(window.location.pathname+'?'+params.toString(), {}, { preserveState:true, preserveScroll:true }); };
  const handleSearch = (t) => { setSearchTerm(t); pushQuery({ search:t }); };
  const handleStatusFilter = (s) => { setStatusFilter(s); pushQuery({ status:s }); };
  const handleSort = (key) => { const dir = sortConfig.key===key && sortConfig.direction==='asc'?'desc':'asc'; setSortConfig({ key, direction:dir }); pushQuery({ sort_by:key, sort_direction:dir }); };
  const handlePageChange = (p) => { setCurrentPage(p); pushQuery({ page:p.toString() }); };
  const handlePageSizeChange = (s) => { setPageSize(s); pushQuery({ per_page:s.toString() }); };

  const handleSelectAll = (checked) => { if (checked) setSelected(paginatedCategories.data.map(c=>c.id)); else setSelected([]); };
  const handleSelectRow = (id, checked) => { if (checked) setSelected(prev=>[...prev, id]); else setSelected(prev=>prev.filter(x=>x!==id)); };
  const handleBulkDelete = () => { if (!selected.length) return; CustomAlert.fire({ title:'Delete Selected Categories?', text:`You are about to delete ${selected.length} category(ies).`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete!', onConfirm:()=>{ setLoading(true); router.post('/inventory/item-category-coding/bulk-destroy', { ids:selected }, { onSuccess:()=>setSelected([]), onFinish:()=>setLoading(false) }); } }); };
  const handleDelete = (category) => { CustomAlert.fire({ title:'Are you sure?', text:`You are about to delete "${category.category_name}". This action cannot be undone!`, icon:'warning', showCancelButton:true, confirmButtonText:'Yes, delete it!', cancelButtonText:'Cancel', onConfirm:()=>{ setLoading(true); router.delete(`/inventory/item-category-coding/${category.id}`, { onFinish:()=>setLoading(false) }); } }); };

  const statusOptions = [ { value:'all', label:'All Status' }, { value:'1', label:'Active' }, { value:'0', label:'Inactive' } ];
  const pageSizeOptions = [10,25,50,100];

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title"><Database className="title-icon" />{usePage().props?.pageTitle || 'Item Category Coding'}</h1>
              <div className="stats-summary">
                <div className="stat-item"><span>{paginatedCategories?.total || 0} Total</span></div>
                <div className="stat-item"><span>{paginatedCategories?.data?.filter(c=>c.is_active).length || 0} Active</span></div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-icon" onClick={()=>window.location.reload()} title="Refresh" disabled={loading}><RefreshCcw size={20} className={loading ? 'animate-spin' : ''} /></button>
              <a href='/inventory/item-category-coding/' className="btn btn-primary"><Plus size={20} />Add Item Category</a>
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
                    placeholder="Search item categories..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Status</label>
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
                  title="Reset all filters"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
          {showColumnSelector && (<div className="column-selector"><div className="column-selector-content"><h3>Show/Hide Columns</h3><div className="column-grid">{Object.entries(visibleColumns).map(([key, visible]) => (key!=='actions' && (<label key={key} className="column-item"><input type="checkbox" checked={visible} onChange={(e)=>setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })} /><span>{key.replace(/([A-Z])/g,' $1').replace(/^./, s=>s.toUpperCase())}</span></label>)))}
          </div><button className="btn btn-sm btn-secondary" onClick={()=>setShowColumnSelector(false)}>Close</button></div></div>)}
        </div>
        {selected.length>0 && (<div className="bulk-actions-bar"><div className="selection-info"><CheckCircle2 size={20} /><span>{selected.length} selected</span></div><div className="bulk-actions"><button className="btn btn-sm btn-secondary" onClick={()=>setSelected([])}><X size={16} />Clear</button><button className="btn btn-sm btn-danger" onClick={handleBulkDelete}><Trash2 size={16} />Delete</button></div></div>)}
        <div className="data-table-container"><div className="table-wrapper"><table className="data-table"><thead><tr>
          <th className="checkbox-cell"><input type="checkbox" className="checkbox" checked={selected.length===paginatedCategories.data.length && paginatedCategories.data.length>0} onChange={(e)=>handleSelectAll(e.target.checked)} /></th>
          {visibleColumns.id && (<th className="sortable" onClick={()=>handleSort('id')}><div className="th-content">ID<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='id'?'active':''}`} /></div></th>)}
          {visibleColumns.categoryCode && (<th className="sortable" onClick={()=>handleSort('category_code')}><div className="th-content">Category Code<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='category_code'?'active':''}`} /></div></th>)}
          {visibleColumns.categoryName && (<th className="sortable" onClick={()=>handleSort('category_name')}><div className="th-content">Category Name<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='category_name'?'active':''}`} /></div></th>)}
          {visibleColumns.inventoryType && (<th><div className="th-content">Inventory Type</div></th>)}
          {visibleColumns.status && (<th className="sortable" onClick={()=>handleSort('is_active')}><div className="th-content">Status<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='is_active'?'active':''}`} /></div></th>)}
          {visibleColumns.updatedAt && (<th className="sortable" onClick={()=>handleSort('updated_at')}><div className="th-content">Updated<ArrowUpDown size={14} className={`sort-icon ${sortConfig.key==='updated_at'?'active':''}`} /></div></th>)}
          {visibleColumns.actions && (<th className="actions-header">Actions</th>)}
        </tr></thead><tbody>
          {paginatedCategories.data.map((category) => (
            <tr key={category.id} className="table-row">
              <td><input type="checkbox" className="checkbox" checked={selected.includes(category.id)} onChange={(e)=>handleSelectRow(category.id, e.target.checked)} /></td>
              {visibleColumns.id && (<td><span className="module-id">#{category.id}</span></td>)}
              {visibleColumns.categoryCode && (<td><div className="module-details"><div className="module-name">{category.category_code}</div></div></td>)}
              {visibleColumns.categoryName && (<td><div className="module-details"><div className="module-name">{category.category_name}</div></div></td>)}
              {visibleColumns.inventoryType && (<td>{category.inventory_type}</td>)}
              {visibleColumns.status && (<td><span className={`status-badge status-${category.is_active ? 'active' : 'inactive'}`}>{category.is_active ? 'Active' : 'Inactive'}</span></td>)}
              {visibleColumns.updatedAt && (<td><div className="date-cell"><Clock size={14} /><span>{new Date(category.updated_at).toLocaleString()}</span></div></td>)}
              {visibleColumns.actions && (
                <td>
                  <div className="actions-cell">
                    <button className="action-btn edit" title="Edit Item Category" onClick={() => router.get(`/inventory/item-category-coding/${category.id}/edit`)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="action-btn delete" title="Delete Item Category" onClick={() => handleDelete(category)}>
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
            <div className="results-info">Showing {paginatedCategories.from || 0} to {paginatedCategories.to || 0} of {paginatedCategories.total || 0} entries</div>
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
              {Array.from({ length: Math.min(7, paginatedCategories.last_page || 1) }, (_, index) => {
                let pageNumber; const totalPages = paginatedCategories.last_page || 1;
                if (totalPages <= 7) pageNumber = index + 1; else if (currentPage <= 4) pageNumber = index + 1; else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + index; else pageNumber = currentPage - 3 + index;
                return (
                  <button key={pageNumber} className={`pagination-btn ${currentPage===pageNumber?'active':''}`} onClick={()=>handlePageChange(pageNumber)}>
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button className="pagination-btn" disabled={currentPage===(paginatedCategories.last_page||1)} onClick={()=>handlePageChange(currentPage+1)} title="Next Page">
              <ChevronRight size={14} />
            </button>
            <button className="pagination-btn" disabled={currentPage===(paginatedCategories.last_page||1)} onClick={()=>handlePageChange(paginatedCategories.last_page||1)} title="Last Page">
              <ChevronRight size={14} />
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="quick-jump">
            <span>Go to:</span>
            <input type="number" min="1" max={paginatedCategories.last_page || 1} value={currentPage} onChange={(e)=>{ const p=Math.max(1, Math.min(paginatedCategories.last_page||1, Number(e.target.value))); handlePageChange(p); }} className="jump-input" />
            <span>of {paginatedCategories.last_page || 1}</span>
          </div>
        </div></div>
      </div>
    </App>
  );
}

  // Handle search and filters
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(window.location.search);
    if (status && status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleSort = useCallback((key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const params = new URLSearchParams(window.location.search);
    params.set('sort_by', key);
    params.set('sort_direction', direction);
    params.set('page', '1');

    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, [sortConfig]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    const params = new URLSearchParams(window.location.search);
    params.set('per_page', size);
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  // Configuration actions
  const handleEdit = (config) => {
    router.get(`/accounts/voucher-number-configuration/${config.id}/edit`);
  };
  
  const handleDelete = (config) => {
    CustomAlert.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${config.voucher_type} Voucher" configuration. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.delete(`/api/voucher-number-configuration/${config.id}`, {
          onSuccess: () => {
            CustomAlert.fire({
              title: 'Deleted!',
              text: `Configuration "${config.voucher_type} Voucher" has been deleted.`,
              icon: 'success'
            });
          },
          onError: () => {
            CustomAlert.fire({
              title: 'Error!',
              text: 'Failed to delete the configuration. Please try again.',
              icon: 'error'
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleView = (config) => {
    router.get(`/accounts/voucher-number-configuration/${config.id}/show`);
  };

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedConfigurations(configurations.map(config => config.id));
    } else {
      setSelectedConfigurations([]);
    }
  };

  const handleSelectConfiguration = (configId, checked) => {
    if (checked) {
      setSelectedConfigurations(prev => [...prev, configId]);
    } else {
      setSelectedConfigurations(prev => prev.filter(id => id !== configId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedConfigurations.length === 0) return;

    CustomAlert.fire({
      title: 'Delete Selected Configurations?',
      text: `You are about to delete ${selectedConfigurations.length} configuration(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/voucher-number-configuration/bulk-destroy', {
          ids: selectedConfigurations
        }, {
          onSuccess: (page) => {
            setSelectedConfigurations([]);
            CustomAlert.fire({
              title: 'Deleted!',
              text: `${selectedConfigurations.length} configuration(s) have been deleted.`,
              icon: 'success'
            });
          },
          onError: (errors) => {
            CustomAlert.fire({
              title: 'Error!',
              text: 'Failed to delete configurations. Please try again.',
              icon: 'error'
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedConfigurations.length === 0) return;

    const action = newStatus ? 'activate' : 'deactivate';
    CustomAlert.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Selected Configurations?`,
      text: `You are about to ${action} ${selectedConfigurations.length} configuration(s).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} them!`,
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/voucher-number-configuration/bulk-status', {
          ids: selectedConfigurations,
          status: newStatus
        }, {
          onSuccess: (page) => {
            setSelectedConfigurations([]);
            CustomAlert.fire({
              title: 'Updated!',
              text: `${selectedConfigurations.length} configuration(s) have been ${action}d.`,
              icon: 'success'
            });
          },
          onError: (errors) => {
            CustomAlert.fire({
              title: 'Error!',
              text: 'Failed to update configurations. Please try again.',
              icon: 'error'
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  // Export functions
  const exportToCSV = () => {
    CustomAlert.fire({
      title: 'Export to CSV',
      text: 'Download all configurations as CSV file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        // Open the export URL in a new window
        window.open('/api/voucher-number-configuration/export-csv', '_blank');
      }
    });
  };

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status ? '#10B981' : '#EF4444';
  };

  const getStatusLabel = (status) => {
    return status ? 'Active' : 'Inactive';
  };

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' }
  ];

  const pageSizeOptions = [10, 25, 50, 100];

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      CustomAlert.fire({
        title: 'Success!',
        text: flash.success,
        icon: 'success',
        confirmButtonText: 'Great!'
      });
    } else if (flash?.error) {
      CustomAlert.fire({
        title: 'Error!',
        text: flash.error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else if (warning) {
      CustomAlert.fire({
        title: 'Warning!',
        text: warning,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }, [flash, warning]);

  return (
    <App>
      <div className="advanced-module-manager">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {usePage().props?.pageTitle || 'Voucher Number Configuration'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{paginatedConfigurations?.total || configurations?.length || 0} Total</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{configurations?.filter(c => c.is_active).length || 0} Active</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={() => window.location.reload()}
                title="Refresh"
                disabled={loading}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* Export Dropdown */}
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle">
                  <Download size={20} />
                  Export
                  <ChevronDown size={16} />
                </button>
                <div className="dropdown-menu">
                  <button onClick={exportToCSV}>
                    <FileText size={16} />
                    Export as CSV
                  </button>
                </div>
              </div>

              <a href='/accounts/voucher-number-configuration/create' className="btn btn-primary">
                <Plus size={20} />
                Add Configuration
              </a>
            </div>
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
                  placeholder="Search configurations..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
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
                title="Reset all filters"
              >
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedConfigurations.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="selection-info">
              <span>{selectedConfigurations.length} configuration(s) selected</span>
            </div>
            <div className="bulk-actions">
              <button
                className="btn btn-sm"
                onClick={() => handleBulkStatusChange(true)}
                style={{ background: '#10B981', color: 'white' }}
              >
                <CheckCircle2 size={16} />
                Activate
              </button>
              <button
                className="btn btn-sm"
                onClick={() => handleBulkStatusChange(false)}
                style={{ background: '#F59E0B', color: 'white' }}
              >
                <XCircle size={16} />
                Deactivate
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Data Table */}
          <div className="data-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading configurations...</p>
              </div>
            ) : !configurations?.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No configurations found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <a href="/accounts/voucher-number-configuration/create" className="btn btn-primary">
                  <Plus size={20} />
                  Add Your First Configuration
                </a>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedConfigurations.length === configurations.length && configurations.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedConfigurations(configurations.map(config => config.id));
                              } else {
                                setSelectedConfigurations([]);
                              }
                            }}
                          />
                        </th>

                        {visibleColumns.id && (
                          <th className="sortable" onClick={() => handleSort('id')}>
                            <div className="th-content">
                              ID
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'id' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.configurationInfo && (
                          <th className="sortable" onClick={() => handleSort('voucher_type')}>
                            <div className="th-content">
                              Configuration Info
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'voucher_type' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.status && (
                          <th className="sortable" onClick={() => handleSort('is_active')}>
                            <div className="th-content">
                              Status
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'is_active' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.updatedAt && (
                          <th className="sortable" onClick={() => handleSort('updated_at')}>
                            <div className="th-content">
                              Updated
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'updated_at' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.actions && (
                          <th className="actions-header">Actions</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {configurations.map((config) => (
                        <tr key={config.id} className="table-row">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedConfigurations.includes(config.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedConfigurations(prev => [...prev, config.id]);
                                } else {
                                  setSelectedConfigurations(prev => prev.filter(id => id !== config.id));
                                }
                              }}
                            />
                          </td>

                          {visibleColumns.id && (
                            <td>
                              <span className="module-id">#{config.id}</span>
                            </td>
                          )}

                          {visibleColumns.configurationInfo && (
                            <td>
                              <div className="module-info">
                                <div className="module-avatar">
                                  <Hash className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="module-details">
                                  <div className="module-name">{config.voucher_type} Voucher</div>
                                  <div className="module-folder">Prefix: {config.prefix} | Length: {config.number_length}</div>
                                  <div className="module-description">Reset: {config.reset_frequency}</div>
                                </div>
                              </div>
                            </td>
                          )}

                          {visibleColumns.status && (
                            <td>
                              <div className="status-container">
                                <span
                                  className={`status-badge status-${config.is_active ? 'active' : 'inactive'}`}
                                  style={{
                                    backgroundColor: `${config.is_active ? '#10B981' : '#EF4444'}15`,
                                    color: config.is_active ? '#10B981' : '#EF4444'
                                  }}
                                >
                                  <div
                                    className="status-dot"
                                    style={{ backgroundColor: config.is_active ? '#10B981' : '#EF4444' }}
                                  ></div>
                                  {config.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.updatedAt && (
                            <td>
                              <div className="date-cell">
                                <Clock size={14} />
                                <span>{formatDate(config.updated_at)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.actions && (
                            <td>
                              <div className="actions-cell">
                                <button
                                  className="action-btn view"
                                  title="View Details"
                                  onClick={() => handleView(config)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="action-btn edit"
                                  title="Edit Configuration"
                                  onClick={() => handleEdit(config)}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  className="action-btn delete"
                                  title="Delete Configuration"
                                  onClick={() => handleDelete(config)}
                                >
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

                {/* Pagination */}
                {paginatedConfigurations && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <div className="results-info">
                        Showing {((paginatedConfigurations.current_page - 1) * paginatedConfigurations.per_page) + 1} to {Math.min(paginatedConfigurations.current_page * paginatedConfigurations.per_page, paginatedConfigurations.total)} of {paginatedConfigurations.total} results
                      </div>
                      <div className="page-size-selector">
                        <span>Show</span>
                        <select
                          className="page-size-select"
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                          {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <span>per page</span>
                      </div>
                    </div>

                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="page-numbers">
                        {Array.from({ length: Math.min(5, paginatedConfigurations.last_page) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= paginatedConfigurations.last_page}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
