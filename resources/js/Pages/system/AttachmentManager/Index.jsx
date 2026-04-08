import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Trash2,
  Download,
  FileText,
  Search,
  HardDrive,
  AlertTriangle,
  CheckSquare,
  Square,
  Upload,
  LayoutGrid,
  List,
  FolderOpen,
  File,
  X,
  Check,
  User,
  FolderPlus,
} from 'lucide-react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatRelativeTime = (dateStr, tr) => {
  if (dateStr == null) return '—';
  // Support Unix timestamp (seconds) so timezone is correct; otherwise ISO/date string
  const date = typeof dateStr === 'number' ? new Date(dateStr * 1000) : new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return tr('system.attachment_manager.index.rel_just_now');
  if (diffMins < 60) return tr('system.attachment_manager.index.rel_minutes_ago', { count: diffMins });
  if (diffHours < 24) return tr('system.attachment_manager.index.rel_hours_ago', { count: diffHours });
  if (diffDays < 7) return tr('system.attachment_manager.index.rel_days_ago', { count: diffDays });
  return date.toLocaleDateString();
};

/** Map built-in folder slugs to i18n; custom / API folders use `label`. */
function getAttachmentFolderLabel(folder, tr) {
  const slug = folder.slug ?? '';
  const keys = {
    '': 'system.attachment_manager.index.folder_all_files',
    'journal-voucher': 'system.attachment_manager.index.folder_journal_voucher',
    'cash-voucher': 'system.attachment_manager.index.folder_cash_voucher',
    'bank-voucher': 'system.attachment_manager.index.folder_bank_voucher',
    'opening-voucher': 'system.attachment_manager.index.folder_opening_voucher',
    general: 'system.attachment_manager.index.folder_general_uploads',
  };
  if (Object.prototype.hasOwnProperty.call(keys, slug)) {
    return tr(keys[slug]);
  }
  return folder.label || slug;
}

const getFileIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (['pdf'].includes(t)) return '📄';
  if (['doc', 'docx'].includes(t)) return '📝';
  if (['xls', 'xlsx'].includes(t)) return '📊';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(t)) return '🖼️';
  if (['zip'].includes(t)) return '📦';
  return '📎';
};

export default function FileManagerIndex() {
  const { storageInfo: initialStorage = {}, company, error: pageError } = usePage().props;
  const { t } = useTranslations();
  const fileTypeOptions = useMemo(
    () => [
      { value: '', label: t('system.attachment_manager.index.filter_all_types') },
      { value: 'pdf', label: 'PDF' },
      { value: 'doc', label: 'DOC' },
      { value: 'docx', label: 'DOCX' },
      { value: 'xls', label: 'XLS' },
      { value: 'xlsx', label: 'XLSX' },
      { value: 'jpg', label: 'JPG' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'png', label: 'PNG' },
      { value: 'gif', label: 'GIF' },
      { value: 'zip', label: 'ZIP' },
    ],
    [t]
  );
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState(initialStorage);
  const [selected, setSelected] = useState([]);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('last_modified');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list | grid
  const [uploading, setUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folders, setFolders] = useState([
    { slug: '' },
    { slug: 'journal-voucher' },
    { slug: 'cash-voucher' },
    { slug: 'bank-voucher' },
    { slug: 'opening-voucher' },
    { slug: 'general' },
  ]);
  const fileInputRef = useRef(null);

  const filters = { search, from_date: '', to_date: '', voucher_type: '', file_type: fileTypeFilter, folder: selectedFolder };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search && String(search).trim()) params.search = String(search).trim();
      if (selectedFolder) params.folder = selectedFolder;
      if (fileTypeFilter) params.file_type = fileTypeFilter;
      const q = new URLSearchParams(params);
      const res = await fetch('/api/attachment-manager/attachments?' + q, {
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        setFiles(Array.isArray(data.data) ? data.data : []);
        setFolders(Array.isArray(data.folders) ? data.folders : []);
      } else {
        setAlert({ type: 'error', message: data.message || t('system.attachment_manager.index.msg_failed_to_load_files') });
      }
    } catch (e) {
      setAlert({ type: 'error', message: t('system.attachment_manager.index.msg_failed_to_load_files') });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStorage = async () => {
    try {
      const res = await fetch('/api/attachment-manager/storage-usage', {
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.used_mb !== undefined) setStorageInfo(data);
      }
    } catch (_) {}
  };

  useEffect(() => { loadFiles(); }, [search, selectedFolder, fileTypeFilter]);
  useEffect(() => { loadStorage(); }, [files.length]);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    setAlert(null);
    try {
      const res = await fetch('/api/attachment-manager/create-folder', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message });
        setNewFolderModalOpen(false);
        setNewFolderName('');
        await loadFiles();
        if (data.folder?.slug) setSelectedFolder(data.folder.slug);
      } else {
        setAlert({ type: 'error', message: data.message || t('system.attachment_manager.index.msg_could_not_create_folder') });
      }
    } catch (e) {
      setAlert({ type: 'error', message: t('system.attachment_manager.index.msg_could_not_create_folder') });
    } finally {
      setCreatingFolder(false);
    }
  };

  const displayFileName = (f) => (f.filename && f.filename.includes('/') ? f.filename.split('/').pop() : f.filename) || f.filename;

  const sortedFiles = [...files].sort((a, b) => {
    let va = a[sortBy] ?? '';
    let vb = b[sortBy] ?? '';
    if (sortBy === 'size') {
      va = a.size ?? 0;
      vb = b.size ?? 0;
      return sortAsc ? va - vb : vb - va;
    }
    if (sortBy === 'last_modified' || sortBy === 'voucher_date') {
      const tsA = sortBy === 'last_modified' && (a.last_modified_ts != null) ? a.last_modified_ts * 1000 : new Date(va).getTime();
      const tsB = sortBy === 'last_modified' && (b.last_modified_ts != null) ? b.last_modified_ts * 1000 : new Date(vb).getTime();
      return sortAsc ? tsA - tsB : tsB - tsA;
    }
    va = String(va).toLowerCase();
    vb = String(vb).toLowerCase();
    const cmp = va.localeCompare(vb);
    return sortAsc ? cmp : -cmp;
  });

  const toggleSelect = (filename) => {
    setSelected((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    );
  };
  const selectAll = () => {
    if (selected.length === files.length) setSelected([]);
    else setSelected(files.map((f) => f.filename));
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(t('system.attachment_manager.index.confirm_delete_files', { count: selected.length }))) return;
    try {
      const res = await fetch('/api/attachment-manager/delete', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ attachment_ids: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message });
        setSelected([]);
        loadFiles();
        loadStorage();
      } else setAlert({ type: 'error', message: data.message || t('system.attachment_manager.index.msg_delete_failed') });
    } catch (e) {
      setAlert({ type: 'error', message: t('system.attachment_manager.index.msg_delete_failed') });
    }
  };

  const handleUpload = async (fileList, subfolder = '') => {
    if (!fileList?.length) return;
    const form = new FormData();
    if (subfolder) form.append('folder', subfolder);
    for (let i = 0; i < fileList.length; i++) form.append('files[]', fileList[i]);
    setUploading(true);
    setAlert(null);
    try {
      const res = await fetch('/api/attachment-manager/upload', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', message: data.message });
        setUploadModalOpen(false);
        await loadFiles();
        await loadStorage();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else setAlert({ type: 'error', message: data.message || t('system.attachment_manager.index.msg_upload_failed') });
    } catch (e) {
      setAlert({ type: 'error', message: t('system.attachment_manager.index.msg_upload_failed') });
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e) => {
    const list = e.target.files;
    if (list?.length) {
      const subfolder = selectedFolder && selectedFolder.startsWith('general/') ? selectedFolder.replace(/^general\//, '') : '';
      handleUpload(Array.from(list), subfolder);
    }
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const list = e.dataTransfer?.files;
    if (list?.length) {
      const subfolder = selectedFolder && selectedFolder.startsWith('general/') ? selectedFolder.replace(/^general\//, '') : '';
      handleUpload(Array.from(list), subfolder);
    }
  };

  const usedMb = storageInfo.used_mb ?? 0;
  const limitMb = storageInfo.limit_mb ?? 1000;
  const usedGiB = (usedMb / 1024).toFixed(2);
  const limitGiB = (limitMb / 1024).toFixed(2);
  const percent = limitMb > 0 ? Math.min(100, (usedMb / limitMb) * 100) : 0;
  const isOverLimit = storageInfo.is_over_limit;
  const isNearLimit = storageInfo.is_near_limit;

  if (pageError) {
    return (
      <App>
        <div className="min-h-[40vh] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-6 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
            <p className="text-red-800 dark:text-red-200">{pageError}</p>
          </div>
        </div>
      </App>
    );
  }

  return (
    <App>
      <div className="advanced-module-manager flex min-h-[calc(100vh-10rem)] w-full overflow-hidden rounded-xl border border-gray-200 !p-0 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate text-gray-900 dark:text-gray-100">{company?.company_name || t('system.attachment_manager.index.company_fallback')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t('system.attachment_manager.index.file_manager')}</p>
              </div>
            </div>
          </div>
          <nav className="p-2 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('system.attachment_manager.index.folders')}</p>
              <button
                type="button"
                onClick={() => setNewFolderModalOpen(true)}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                title={t('system.attachment_manager.index.new_folder')}
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
            {folders.length === 0 ? (
              <button
                onClick={() => setSelectedFolder('')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <FolderOpen className="w-5 h-5" />
                {t('system.attachment_manager.index.folder_all_files')}
              </button>
            ) : (
              folders.map((folder) => (
                <button
                  key={folder.slug}
                  onClick={() => setSelectedFolder(folder.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-medium transition-colors ${
                    selectedFolder === folder.slug
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <FolderOpen className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{getAttachmentFolderLabel(folder, t)}</span>
                </button>
              ))
            )}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('system.attachment_manager.index.space')}</p>
              <div className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {usedGiB} GiB / {limitGiB} GiB
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('system.attachment_manager.index.files')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('system.attachment_manager.index.items_count', { count: files.length })}</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col bg-white dark:bg-gray-900">
          {/* Top bar — nowrap so Upload/actions stay aligned with the toolbar row, not wrapped under the table header */}
          <div className="flex min-h-14 flex-nowrap items-center gap-3 overflow-x-auto border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative max-w-md min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('system.attachment_manager.index.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="w-[min(140px,40vw)] shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:w-auto sm:min-w-[120px]"
              >
                {fileTypeOptions.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                title={viewMode === 'list' ? t('system.attachment_manager.index.view_grid') : t('system.attachment_manager.index.view_list')}
              >
                {viewMode === 'list' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </button>
              <button
                onClick={() => !uploading && fileInputRef.current?.click()}
                disabled={uploading}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4 sm:text-base"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('system.attachment_manager.index.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {t('system.attachment_manager.index.btn_upload')}
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip"
                className="hidden"
                onChange={onFileInputChange}
              />
              {selected.length > 0 && (
                <>
                  <button
                    onClick={() => selected.forEach((fn) => { const f = files.find((x) => x.filename === fn); if (f) window.open(f.url, '_blank'); })}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    title={t('system.attachment_manager.index.download_selected')}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('system.attachment_manager.index.btn_delete_selected', { count: selected.length })}
                  </button>
                </>
              )}
            </div>
          </div>

          {alert && (
            <div
              className={`mx-4 mt-4 flex items-center justify-between rounded-lg px-4 py-3 ${
                alert.type === 'success'
                  ? 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200'
              }`}
            >
              <span>{alert.message}</span>
              <button onClick={() => setAlert(null)} className="p-1 hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className={`relative flex-1 overflow-auto p-4 ${dragOver ? 'bg-blue-50 ring-2 ring-inset ring-blue-500 dark:bg-blue-900/10' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {/* Full-area upload overlay so user sees upload in progress */}
            {uploading && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{t('system.attachment_manager.index.uploading_files')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('system.attachment_manager.index.please_wait_do_not_close_the_page')}</p>
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
                    <table className="w-full">
                      <thead className="bg-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-3 w-10">
                            <button onClick={selectAll} className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700" disabled={!files.length}>
                              {files.length > 0 && selected.length === files.length ? (
                                <CheckSquare className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th
                            className="cursor-pointer px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => { setSortBy('filename'); setSortAsc((s) => !s); }}
                          >
                            {t('system.attachment_manager.index.col_name')} {sortBy === 'filename' && (sortAsc ? '↑' : '↓')}
                          </th>
                          <th
                            className="w-28 cursor-pointer px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => { setSortBy('size'); setSortAsc((s) => !s); }}
                          >
                            {t('system.attachment_manager.index.col_size')} {sortBy === 'size' && (sortAsc ? '↑' : '↓')}
                          </th>
                          <th
                            className="w-40 cursor-pointer select-none px-4 py-3 hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => { setSortBy('last_modified'); setSortAsc((s) => !s); }}
                            title={t('system.attachment_manager.index.click_to_sort_by_last_modified')}
                          >
                            {t('system.attachment_manager.index.col_last_modified')}
                            {sortBy === 'last_modified' && (sortAsc ? ' ↑' : ' ↓')}
                          </th>
                          <th className="px-4 py-3 w-24 text-right">{t('system.attachment_manager.index.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedFiles.map((f) => (
                          <tr key={f.filename} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-2">
                              <button
                                onClick={() => toggleSelect(f.filename)}
                                className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                {selected.includes(f.filename) ? (
                                  <CheckSquare className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{getFileIcon(f.file_type)}</span>
                                <span className="max-w-xs truncate font-medium text-gray-900 dark:text-gray-100" title={f.filename}>
                                  {displayFileName(f)}
                                </span>
                                {f.folder_label && (
                                  <span className="max-w-[120px] truncate text-xs text-gray-500" title={f.folder_label}>
                                    {f.folder_label}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{formatFileSize(f.size)}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                              {formatRelativeTime(f.last_modified_ts ?? f.last_modified ?? f.voucher_date, t)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <a
                                href={f.download_url || f.url}
                                download
                                className="inline-block rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                                title={t('system.attachment_manager.index.download')}
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                    {sortedFiles.map((f) => (
                      <div
                        key={f.filename}
                        className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
                      >
                        <button
                          onClick={() => toggleSelect(f.filename)}
                          className="self-start rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {selected.includes(f.filename) ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <span className="text-4xl my-2">{getFileIcon(f.file_type)}</span>
                        <p className="w-full truncate text-sm font-medium text-gray-900 dark:text-gray-100" title={f.filename}>
                          {displayFileName(f)}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{formatFileSize(f.size)}</p>
                        <a
                          href={f.download_url || f.url}
                          download
                          className="mt-2 inline-block rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                          title={t('system.attachment_manager.index.download')}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && files.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                    <File className="mb-4 h-16 w-16 opacity-50" />
                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{t('system.attachment_manager.index.no_files_yet')}</p>
                    <p className="mt-1 text-sm">{t('system.attachment_manager.index.upload_files_or_they_will_appear_when_at')}</p>
                    <button
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      disabled={uploading}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('system.attachment_manager.index.uploading')}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {t('system.attachment_manager.index.upload_files')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Upload modal (optional – we use direct input + drag-drop) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('system.attachment_manager.index.upload_files')}</h3>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip"
              onChange={(e) => {
                const list = e.target.files;
                if (list?.length) {
                  const sub = selectedFolder && selectedFolder.startsWith('general/') ? selectedFolder.replace(/^general\//, '') : '';
                  handleUpload(Array.from(list), sub);
                }
              }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white dark:text-gray-400"
            />
            {uploading && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('system.attachment_manager.index.uploading')}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {t('common.actions.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New folder modal */}
      {newFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !creatingFolder && setNewFolderModalOpen(false)}>
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <FolderPlus className="h-5 w-5" />
              {t('system.attachment_manager.index.title_new_folder')}
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder={t('system.attachment_manager.index.folder_name')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setNewFolderModalOpen(false); setNewFolderName(''); }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {t('common.actions.cancel')}
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={creatingFolder || !newFolderName.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingFolder ? t('system.attachment_manager.index.btn_creating') : t('common.actions.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </App>
  );
}
