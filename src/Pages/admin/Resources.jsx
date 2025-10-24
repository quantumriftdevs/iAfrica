import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getResources, createResource, updateResource, deleteResource } from '../../utils/api';
import { X } from 'lucide-react';
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
  const [form, setForm] = useState({ title: '', type: '', url: '', visibility: 'public' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.push('Title required', { type: 'error' });
    setCreating(true);
    try {
      await createResource(form);
      const res = await getResources();
      setResources(Array.isArray(res) ? res : []);
      setIsCreateOpen(false);
      setForm({ title: '', type: '', url: '', visibility: 'public' });
      toast.push('Resource created', { type: 'success' });
    } catch (err) {
      console.error('Create resource error', err);
      toast.push('Failed to create resource', { type: 'error' });
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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Resources</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Resources</h3>
          <button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded">Create Resource</button>
        </div>
        {loading ? (
          <div className="py-8 text-center">Loading resources...</div>
          ) : resources.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No resources found</div>
        ) : (
          <DataTable columns={columns.map(c => c.key === 'actions' ? { ...c, render: (_v, row) => (
            <div className="flex items-center gap-3">
              <button onClick={() => openEdit(row)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(row._id || row._id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          ) } : c)} data={resources} />
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Create Resource</h4>
              <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 gap-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="p-3 border rounded" />
              <input name="type" value={form.type} onChange={handleChange} placeholder="Type" className="p-3 border rounded" />
              <input name="url" value={form.url} onChange={handleChange} placeholder="URL or file ref" className="p-3 border rounded" />
              <select name="visibility" value={form.visibility} onChange={handleChange} className="p-3 border rounded">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{creating ? 'Creating...' : 'Create Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editingRes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Edit Resource</h4>
              <button onClick={() => { setIsEditOpen(false); setEditingRes(null); }} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 gap-4">
              <input name="title" value={editingRes.title} onChange={handleEditChange} placeholder="Title" className="p-3 border rounded" />
              <input name="type" value={editingRes.type} onChange={handleEditChange} placeholder="Type" className="p-3 border rounded" />
              <input name="url" value={editingRes.url} onChange={handleEditChange} placeholder="URL or file ref" className="p-3 border rounded" />
              <select name="visibility" value={editingRes.visibility} onChange={handleEditChange} className="p-3 border rounded">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditOpen(false); setEditingRes(null); }} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={editing} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{editing ? 'Updating...' : 'Update Resource'}</button>
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
