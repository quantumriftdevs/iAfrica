import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getResources, createResource, updateResource, deleteResource, uploadResourceFile, formatApiError } from '../../utils/api';
import { X, Plus, BookOpen } from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ResourcesAdminPage = () => {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getResources();
        if (!mounted) return;
        setResources(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Resources fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'visibility', label: 'Visibility' },
    { key: 'actions', label: 'Actions' }
  ];

  // create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', resourceType: 'document', course: '', visibility: 'public', file: null });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.push('Title required', { type: 'error' });
    setCreating(true);
    try {
      // Upload-first flow: if a file is provided upload it first to /api/v1/resources/{id}/upload
      let uploadedFileRef = null;
      if (form.file) {
        try {
          const tempId = `tmp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          const fd = new FormData();
          fd.append('file', form.file);
          const uploadRes = await uploadResourceFile(tempId, fd);
          uploadedFileRef = (uploadRes && uploadRes.data && uploadRes.data.file) || uploadRes.file || (uploadRes && uploadRes.data) || null;
        } catch (uErr) {
          console.error('File upload failed', uErr);
          toast.push(formatApiError(uErr) || 'Failed to upload file', { type: 'error' });
          setCreating(false);
          return;
        }
      }

      const payload = {
        title: form.title,
        description: form.description || undefined,
        resourceType: form.resourceType || 'document',
        course: form.course || undefined,
        visibility: form.visibility || 'public',
        file: uploadedFileRef || undefined
      };

      await createResource(payload);
      const res = await getResources();
      setResources(Array.isArray(res) ? res : []);
      setIsCreateOpen(false);
      setForm({ title: '', description: '', resourceType: 'document', course: '', visibility: 'public', file: null });
      toast.push('Resource created', { type: 'success' });
    } catch (err) {
      console.error('Create resource error', err);
      toast.push(formatApiError(err) || 'Failed to create resource', { type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingRes, setEditingRes] = useState(null);
  const openEdit = (r) => {
    setEditingRes({ id: r._id || r._id, title: r.title || '', type: r.type || '', url: r.url || '', visibility: r.visibility || 'public' });
    setIsEditOpen(true);
  };
  const handleEditChange = (e) => setEditingRes({ ...editingRes, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingRes || !editingRes._id) return;
    setEditing(true);
    try {
      await updateResource(editingRes._id, { title: editingRes.title, type: editingRes.type, url: editingRes.url, visibility: editingRes.visibility });
      const res = await getResources();
      setResources(Array.isArray(res) ? res : []);
      setIsEditOpen(false);
      setEditingRes(null);
      toast.push('Resource updated', { type: 'success' });
    } catch (err) {
      console.error('Update resource error', err);
      toast.push('Failed to update resource', { type: 'error' });
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return setIsDeleteOpen(false);
    try {
      await deleteResource(deleteTarget);
      const res = await getResources();
      setResources(Array.isArray(res) ? res : []);
      toast.push('Resource deleted', { type: 'success' });
    } catch (err) {
      console.error('Delete resource error', err);
      toast.push('Failed to delete resource', { type: 'error' });
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-600 mt-2">Manage learning materials and resources</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
            <Plus size={20} /> Create Resource
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center mt-8">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No resources available</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <DataTable columns={columns.map(c => c.key === 'actions' ? { ...c, render: (_v, row) => (
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(row)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(row._id || row._id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              ) } : c)} data={resources} />
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900">Create Resource</h4>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Resource title" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Short description (optional)" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">Course (optional)</label>
                <input id="course" name="course" value={form.course} onChange={handleChange} placeholder="Course id or name" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File (optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-500 transition-colors">
                  <input type="file" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} className="block w-full text-sm text-gray-700" />
                  {form.file && <p className="text-sm text-emerald-600 font-medium mt-2">✓ {form.file.name}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <select id="visibility" name="visibility" value={form.visibility} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-semibold">{creating ? 'Creating...' : 'Create Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editingRes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900">Edit Resource</h4>
              <button onClick={() => { setIsEditOpen(false); setEditingRes(null); }} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input id="edit-title" name="title" value={editingRes.title} onChange={handleEditChange} placeholder="Resource title" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <input id="edit-type" name="type" value={editingRes.type} onChange={handleEditChange} placeholder="e.g., PDF, Video, Document" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 mb-2">URL or File Reference</label>
                <input id="edit-url" name="url" value={editingRes.url} onChange={handleEditChange} placeholder="https://example.com/resource" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="edit-visibility" className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <select id="edit-visibility" name="visibility" value={editingRes.visibility} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsEditOpen(false); setEditingRes(null); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={editing} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-semibold">{editing ? 'Updating...' : 'Update Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal open={isDeleteOpen} title="Delete resource" message="Delete this resource?" onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} onConfirm={confirmDelete} />
    </div>
  );
};

export default ResourcesAdminPage;
