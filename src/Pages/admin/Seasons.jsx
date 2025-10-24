import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getSeasons, getPrograms, createSeason, updateSeason, deleteSeason, formatApiError } from '../../utils/api';
import { X } from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

const SeasonsPage = () => {
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [programs, setPrograms] = useState([]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'startDate', label: 'Start' },
    { key: 'endDate', label: 'End' },
    { key: 'actions', label: 'Actions', render: (_v, row) => (
      <div className="flex items-center gap-3">
        <button onClick={() => openEdit(row)} className="text-blue-600 hover:underline">Edit</button>
        <button onClick={() => handleDelete(row._id || row._id)} className="text-red-600 hover:underline">Delete</button>
      </div>
    ) }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSeasons();
        if (!mounted) return;
        setSeasons(Array.isArray(res) ? res : []);
        // also fetch programs for the create/edit form
        try {
          const p = await getPrograms();
          if (!mounted) return;
          setPrograms(Array.isArray(p) ? p : []);
        } catch (pe) {
          console.error('Programs fetch error', pe);
        }
      } catch (e) {
        console.error('Seasons fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const toast = useToast();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', program: '', startDate: '', endDate: '', isVisible: true, isActive: true });

  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.push('Name is required', { type: 'error' });
      return;
    }
    setCreating(true);
    try {
      await createSeason({
        name: form.name,
        description: form.description || undefined,
        program: form.program || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        createdBy: user._id,
        isVisible: form.isVisible === undefined ? true : !!form.isVisible,
        isActive: form.isActive === undefined ? true : !!form.isActive
      });
      const res = await getSeasons();
      setSeasons(Array.isArray(res) ? res : []);
      setIsCreateOpen(false);
      setForm({ name: '', description: '', program: '', startDate: '', endDate: '', isVisible: true, isActive: true });
      toast.push('Season created', { type: 'success' });
    } catch (err) {
      console.error('Create season error', err);
      toast.push(formatApiError(err) || 'Failed to create season', { type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);

  const openEdit = (s) => {
    const programId = typeof s.program === 'string' ? s.program : (s.program && (s.program._id || s.program.id));
    setEditingSeason({ _id: s._id || s.id, name: s.name || '', description: s.description || '', program: programId || '', startDate: s.startDate || s.start || '', endDate: s.endDate || s.end || '', isVisible: s.isVisible === undefined ? true : !!s.isVisible, isActive: s.isActive === undefined ? true : !!s.isActive });
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingSeason({ ...editingSeason, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingSeason || !(editingSeason._id || editingSeason.id)) return;
    setEditing(true);
    try {
      const id = editingSeason._id || editingSeason.id;
      await updateSeason(id, { name: editingSeason.name, description: editingSeason.description || undefined, program: editingSeason.program || undefined, startDate: editingSeason.startDate || undefined, endDate: editingSeason.endDate || undefined, isVisible: editingSeason.isVisible === undefined ? true : !!editingSeason.isVisible, isActive: editingSeason.isActive === undefined ? true : !!editingSeason.isActive });
      const res = await getSeasons();
      setSeasons(Array.isArray(res) ? res : []);
      setIsEditOpen(false);
      setEditingSeason(null);
      toast.push('Season updated', { type: 'success' });
    } catch (err) {
      console.error('Update season error', err);
      toast.push(formatApiError(err) || 'Failed to update season', { type: 'error' });
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
      await deleteSeason(deleteTarget);
      const res = await getSeasons();
      setSeasons(Array.isArray(res) ? res : []);
      toast.push('Season deleted', { type: 'success' });
    } catch (err) {
      console.error('Delete season error', err);
      toast.push(formatApiError(err) || 'Failed to delete season', { type: 'error' });
    } finally {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Seasons</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Seasons</h3>
          <button onClick={() => setIsCreateOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded">Create Season</button>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading seasons...</div>
        ) : seasons.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No seasons found</div>
        ) : (
          <DataTable columns={columns} data={seasons} />
        )}
      </div>

      {/* Create Season Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Create Season</h4>
              <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Season name" className="p-3 border rounded" />
              <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-3 border rounded" />
              <select name="program" value={form.program} onChange={handleChange} className="p-3 border rounded">
                <option value="">Select program</option>
                {programs.map((prog) => (
                  <option key={prog._id || prog.id || prog.name} value={prog._id || prog.id}>{prog.name || prog.title}</option>
                ))}
              </select>
              <input name="startDate" value={form.startDate} onChange={handleChange} placeholder="Start date (YYYY-MM-DD)" className="p-3 border rounded" />
              <input name="endDate" value={form.endDate} onChange={handleChange} placeholder="End date (YYYY-MM-DD)" className="p-3 border rounded" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={creating} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{creating ? 'Creating...' : 'Create Season'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Season Modal */}
      {isEditOpen && editingSeason && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="relative p-6 border-b">
              <h4 className="text-xl font-semibold">Edit Season</h4>
              <button onClick={() => { setIsEditOpen(false); setEditingSeason(null); }} className="absolute top-4 right-4 bg-black/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 gap-4">
              <input name="name" value={editingSeason.name} onChange={handleEditChange} placeholder="Season name" className="p-3 border rounded" />
              <input name="description" value={editingSeason.description} onChange={handleEditChange} placeholder="Description" className="p-3 border rounded" />
              <select name="program" value={editingSeason.program} onChange={handleEditChange} className="p-3 border rounded">
                <option value="">Select program</option>
                {programs.map((prog) => (
                  <option key={prog._id || prog.id || prog.name} value={prog._id || prog.id}>{prog.name || prog.title || prog._id}</option>
                ))}
              </select>
              <input name="startDate" value={editingSeason.startDate} onChange={handleEditChange} placeholder="Start date (YYYY-MM-DD)" className="p-3 border rounded" />
              <input name="endDate" value={editingSeason.endDate} onChange={handleEditChange} placeholder="End date (YYYY-MM-DD)" className="p-3 border rounded" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setIsEditOpen(false); setEditingSeason(null); }} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={editing} className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50">{editing ? 'Updating...' : 'Update Season'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal open={isDeleteOpen} title="Delete season" message="Delete this season?" onCancel={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} onConfirm={confirmDelete} />
    </div>
  );
};

export default SeasonsPage;
