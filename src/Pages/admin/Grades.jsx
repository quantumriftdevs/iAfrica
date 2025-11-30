import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getClasses, getGrades, createGrade, updateGrade, formatApiError, getPrograms } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Award } from 'lucide-react';

const AdminGrades = () => {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [programs, setPrograms] = useState([]);

  const { getCurrentUser } = useAuth();

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Price' },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer dedicated grades endpoint; fall back to classes-derived data
        let gdata = [];
        try {
          const res = await getGrades();
          gdata = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        } catch {
          // fallback to deriving from classes
          const cres = await getClasses();
          gdata = Array.isArray(cres) ? cres.flatMap(c => (c.grades || []).map(g => ({ name: g.name || g.title || g.label || 'Grade', description: g.description || '', startDate: g.startDate || g.from || '', endDate: g.endDate || g.to || '', program: g.program || c.program || null, _id: g._id }))) : [];
        }

        if (!mounted) return;
        setGrades(Array.isArray(gdata) ? gdata : []);

        // load programs for create/select
        try {
          const progs = await getPrograms();
          if (mounted) setPrograms(Array.isArray(progs) ? progs : (progs && progs.data ? progs.data : []));
        } catch {
          // ignore
        }
      } catch (e) {
        console.error('Grades fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Grades Management</h2>
            <p className="text-gray-600">Manage grade levels and their pricing</p>
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl">
            <Plus size={18} /> Create Grade
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Grades</h3>
            <p className="text-gray-600 text-sm mt-1">Complete list of grade levels available</p>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600"></div>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center">
              <Award size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No grades found</p>
              <p className="text-gray-500 text-sm mt-2">Create a new grade to get started</p>
            </div>
          ) : (
            <DataTable columns={[...columns, { key: 'actions', label: 'Actions', render: (v, row) => (
              <button onClick={() => setEditing(row)} className="px-3 py-1 text-sm rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors font-medium">Edit</button>
            ) }]} data={grades} />
          )}
        </div>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create Grade</h3>
              <button onClick={() => setCreating(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Name *</label>
                <input placeholder="e.g., Grade 10" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={(formData && formData.name) || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea placeholder="Grade description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setFormData({ ...formData, description: e.target.value })} value={(formData && formData.description) || ''} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setFormData({ ...formData, program: e.target.value })} value={(formData && (formData.program || ''))}>
                  <option value="">Select program</option>
                  {programs.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.title || p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setFormData({ ...formData, price: e.target.value })} value={(formData && formData.price) || ''} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true);
                try {
                  const user = await getCurrentUser();
                  const payload = {
                    name: formData.name,
                    description: formData.description,
                    program: formData.program,
                    createdBy: user._id,
                    price: formData.price,
                    isActive: true
                  };
                  const created = await createGrade(payload);
                  setGrades(s => [created, ...s]);
                  setCreating(false);
                  setEditing(null);
                  setFormData(null);
                  toast.push('Grade created successfully', { type: 'success' });
                } catch (e) {
                  console.error('Create grade error', e);
                  toast.push(formatApiError(e) || 'Failed to create grade', { type: 'error' });
                } finally {
                  setSaving(false);
                }
              }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Creating...' : 'Create Grade'}</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Grade</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Name *</label>
                <input placeholder="e.g., Grade 10" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setEditing({ ...editing, name: e.target.value })} value={editing.name || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea placeholder="Grade description" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setEditing({ ...editing, description: e.target.value })} value={editing.description || ''} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setEditing({ ...editing, program: e.target.value })} value={(editing.program && (editing.program._id || editing.program)) || ''}>
                  <option value="">Select program</option>
                  {programs.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.title || p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" onChange={(e) => setEditing({ ...editing, price: e.target.value })} value={(editing && editing.price) || ''} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true);
                try {
                  const id = editing._id || editing.id;
                  const payload = { name: editing.name, description: editing.description, program: editing.program, price: editing.price, isVisible: true, isActive: true };
                  await updateGrade(id, payload);
                  setGrades((s) => s.map(g => (g._id === id || g.id === id ? { ...g, ...payload } : g)));
                  setEditing(null);
                  toast.push('Grade updated successfully', { type: 'success' });
                } catch (e) {
                  console.error('Update grade error', e);
                  toast.push(formatApiError(e) || 'Failed to update grade', { type: 'error' });
                } finally {
                  setSaving(false);
                }
              }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGrades;
