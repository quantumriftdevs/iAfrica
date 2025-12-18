import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import { getSeasons, getPrograms, createSeason, updateSeason, deleteSeason, formatApiError } from '../../utils/api';
import { X, Plus, Calendar } from 'lucide-react';
import { useToast } from '../../components/ui/ToastContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, toInputDate } from '../../utils/helpers';

const SeasonsPage = () => {
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [programs, setPrograms] = useState([]);

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'startDate',
      label: 'Start',
      render: (v, row) => formatDate(v || row.startDate || row.start || row.start_date)
    },
    {
      key: 'endDate',
      label: 'End',
      render: (v, row) => formatDate(v || row.endDate || row.end || row.end_date)
    },
    { key: 'actions', label: 'Actions', render: (_v, row) => (
      <div className="flex items-center gap-3">
        <button onClick={() => openEdit(row)} className="text-blue-600 hover:underline">Edit</button>
        <button onClick={() => handleDelete(row._id || row.id)} className="text-red-600 hover:underline">Delete</button>
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
  const [form, setForm] = useState({
    name: '',
    description: '',
    program: '',
    startDate: '',
    endDate: '',
    isVisible: true,
    isActive: true
  });

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
    setEditingSeason({
      _id: s._id || s.id,
      name: s.name || '',
      description: s.description || '',
      program: programId || '',
      startDate: toInputDate(s.startDate || s.start || s.start_date || ''),
      endDate: toInputDate(s.endDate || s.end || s.end_date || ''),
      isVisible: s.isVisible === undefined ? true : !!s.isVisible,
      isActive: s.isActive === undefined ? true : !!s.isActive
    });
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
      await updateSeason(id, {
        name: editingSeason.name,
        description: editingSeason.description || undefined,
        program: editingSeason.program || undefined,
        startDate: editingSeason.startDate || undefined,
        endDate: editingSeason.endDate || undefined,
        isVisible: editingSeason.isVisible === undefined ? true : !!editingSeason.isVisible,
        isActive: editingSeason.isActive === undefined ? true : !!editingSeason.isActive
      });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Seasons</h1>
            <p className="text-gray-600 mt-2">Manage academic seasons and schedules</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
            <Plus size={20} /> Create Season
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
          </div>
        ) : seasons.length === 0 ? (
          <div className="py-12 text-center mt-8">
            <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No seasons available</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <DataTable columns={columns} data={seasons} />
            </div>
          </div>
        )}
      </div>

      {/* Create Season Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900">Create Season</h4>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Season Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Spring 2025" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input id="description" name="description" value={form.description} onChange={handleChange} placeholder="Season description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">Program (Optional)</label>
                <select id="program" name="program" value={form.program} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select program</option>
                  {programs.map((prog) => (
                    <option key={prog._id || prog.id || prog.name} value={prog._id || prog.id}>{prog.name || prog.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input id="startDate" type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input id="endDate" type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-semibold">{creating ? 'Creating...' : 'Create Season'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Season Modal */}
      {isEditOpen && editingSeason && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900">Edit Season</h4>
              <button onClick={() => { setIsEditOpen(false); setEditingSeason(null); }} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">Season Name</label>
                <input id="edit-name" name="name" value={editingSeason.name} onChange={handleEditChange} placeholder="e.g., Spring 2025" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input id="edit-description" name="description" value={editingSeason.description} onChange={handleEditChange} placeholder="Season description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="edit-program" className="block text-sm font-medium text-gray-700 mb-2">Program (Optional)</label>
                <select id="edit-program" name="program" value={editingSeason.program} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select program</option>
                  {programs.map((prog) => (
                    <option key={prog._id || prog.id || prog.name} value={prog._id || prog.id}>{prog.name || prog.title || prog._id}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input id="edit-startDate" type="date" name="startDate" value={editingSeason.startDate} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input id="edit-endDate" type="date" name="endDate" value={editingSeason.endDate} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsEditOpen(false); setEditingSeason(null); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={editing} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-semibold">{editing ? 'Updating...' : 'Update Season'}</button>
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
