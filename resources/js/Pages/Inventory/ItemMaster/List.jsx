import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Search, Download, Trash2, Edit, Eye } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import App from '../../App.jsx';

const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />
              )}

              {item.href ? (
                <a href={item.href} className="breadcrumb-link-themed">
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current-themed">{item.label}</span>
              )}
            </div>

            {index < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="breadcrumbs-description">Manage product masters with complete specifications, pricing, and tax information</div>
    </div>
  );
};

const ItemMasterList = () => {
  const {
    items = [],
    filters = {},
    error,
  } = usePage().props;

  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [sortBy, setSortBy] = useState(filters?.sort_by || 'item_code');
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');
  const [perPage, setPerPage] = useState(filters?.per_page || 25);
  const [selectedItems, setSelectedItems] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.get('/inventory/item-master', {
        search: searchTerm,
        status: statusFilter,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: perPage,
      }, { preserveState: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, sortBy, sortDirection, perPage]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteItem = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      router.delete(`/inventory/item-master/${itemId}`, {
        onSuccess: () => setAlert({ type: 'success', message: 'Item deleted successfully' }),
        onError: () => setAlert({ type: 'error', message: 'Failed to delete item' }),
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      setAlert({ type: 'warning', message: 'Please select at least one item' });
      return;
    }

    if (confirm(`Delete ${selectedItems.length} items?`)) {
      router.post('/inventory/item-master/bulk-destroy', { ids: selectedItems }, {
        onSuccess: () => {
          setSelectedItems([]);
          setAlert({ type: 'success', message: 'Items deleted successfully' });
        },
        onError: () => setAlert({ type: 'error', message: 'Failed to delete items' }),
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Item Master', icon: List },
  ];

  return (
    <div className="list-page-wrapper">
      <Breadcrumbs items={breadcrumbItems} />

      {error && (
        <div className="alert-error-themed mb-4">
          <p>{error}</p>
        </div>
      )}

      {alert && (
        <div className={`alert-${alert.type}-themed mb-4`}>
          <p>{alert.message}</p>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="list-controls">
        <div className="controls-row">
          <div className="search-group">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by item code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>

            <select
              value={perPage}
              onChange={(e) => setPerPage(e.target.value)}
              className="filter-select"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>

          <div className="action-group">
            <button className="btn-action btn-export" title="Export to CSV">
              <Download size={18} /> Export
            </button>
            {selectedItems.length > 0 && (
              <button
                className="btn-action btn-delete"
                onClick={handleBulkDelete}
                title="Delete selected items"
              >
                <Trash2 size={18} /> Delete ({selectedItems.length})
              </button>
            )}
            <a href="/inventory/item-master/create" className="btn-action btn-primary">
              <Plus size={18} /> Create Item
            </a>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="table-container">
        {items?.data?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.data.length && items.data.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(items.data.map(item => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </th>
                <th onClick={() => handleSort('item_code')} className="sortable-header">
                  Item Code
                  {sortBy === 'item_code' && <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>}
                </th>
                <th onClick={() => handleSort('item_name_short')} className="sortable-header">
                  Item Name
                  {sortBy === 'item_name_short' && <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>}
                </th>
                <th>Item Type</th>
                <th>Category</th>
                <th>Costing Method</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
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
                    <span className="badge badge-info">{item.item_type}</span>
                  </td>
                  <td className="text-sm">{item.category?.category_name || '-'}</td>
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
                        title="Edit"
                      >
                        <Edit size={16} />
                      </a>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete"
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
            <List size={48} />
            <h3>No Items Found</h3>
            <p>No inventory items yet. Create your first item to get started.</p>
            <a href="/inventory/item-master/create" className="btn-primary mt-4">
              Create Item
            </a>
          </div>
        )}
      </div>

      {/* Pagination */}
      {items?.links && items.links.length > 0 && (
        <div className="pagination-container">
          {items.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className={`pagination-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ListPage = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg list-container border-slate-200">
        <div className="p-6">
          <ItemMasterList />
        </div>
      </div>
    </App>
  );
};

export default ListPage;
