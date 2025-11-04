import React, { useEffect, useState } from 'react';
import DataTable from '../../components/lecturer/DataTable';
import { getClasses, getGrades, createGrade, updateGrade, formatApiError, getPrograms } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

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
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Grades Management</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-end mb-4">
          <button onClick={() => setCreating(true)} className="px-3 py-2 rounded bg-emerald-600 text-white">New Grade</button>
        </div>
        {loading ? (
          <div className="py-8 text-center">Loading grades...</div>
        ) : grades.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No grades to manage</div>
        ) : (
          <DataTable columns={[...columns, { key: 'actions', label: 'Actions', render: (v, row) => (
            <div className="flex gap-2">
              <button onClick={() => setEditing(row)} className="text-sm px-2 py-1 rounded border">Edit</button>
            </div>
          ) }]} data={grades} />
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create Grade</h3>
            <div className="space-y-3">
              <input placeholder="Name" className="w-full border rounded px-3 py-2" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={(formData && formData.name) || ''} />
              <textarea placeholder="Description" className="w-full border rounded px-3 py-2" onChange={(e) => setFormData({ ...formData, description: e.target.value })} value={(formData && formData.description) || ''} />
              <select className="w-full border rounded px-3 py-2" onChange={(e) => setFormData({ ...formData, program: e.target.value })} value={(formData && (formData.program || ''))}>
                <option value="">Select program</option>
                {programs.map((p) => {
                  return (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.title || p.name}</option>
                  );
                })}
              </select>
              <input placeholder="Price" className="w-full border rounded px-3 py-2" onChange={(e) => setFormData({ ...formData, price: e.target.value })} value={(formData && formData.price) || ''} />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 py-2 rounded border">Cancel</button>
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
                  toast.push('Grade created', { type: 'success' });
                } catch (e) {
                  console.error('Create grade error', e);
                  toast.push(formatApiError(e) || 'Failed to create grade', { type: 'error' });
                } finally {
                  setSaving(false);
                }
              }} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Edit Grade</h3>
            <div className="space-y-3">
              <input placeholder="Name" className="w-full border rounded px-3 py-2" onChange={(e) => setEditing({ ...editing, name: e.target.value })} value={editing.name || ''} />
              <textarea placeholder="Description" className="w-full border rounded px-3 py-2" onChange={(e) => setEditing({ ...editing, description: e.target.value })} value={editing.description || ''} />
              <select className="w-full border rounded px-3 py-2" onChange={(e) => setEditing({ ...editing, program: e.target.value })} value={(editing.program && (editing.program._id || editing.program)) || ''}>
                <option value="">Select program</option>
                {programs.map((p) => {
                  return (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.title || p.name}</option>
                  );
                })}
              </select>
              <input placeholder="Price" className="w-full border rounded px-3 py-2" onChange={(e) => setEditing({ ...editing, price: e.target.value })} value={(editing && editing.price) || ''} />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">Cancel</button>
              <button disabled={saving} onClick={async () => {
                setSaving(true);
                try {
                  const id = editing._id || editing.id;
                  const payload = { name: editing.name, description: editing.description, program: editing.program, price: editing.price, isVisible: true, isActive: true };
                  await updateGrade(id, payload);
                  setGrades((s) => s.map(g => (g._id === id || g.id === id ? { ...g, ...payload } : g)));
                  setEditing(null);
                  toast.push('Grade updated', { type: 'success' });
                } catch (e) {
                  console.error('Update grade error', e);
                  toast.push(formatApiError(e) || 'Failed to update grade', { type: 'error' });
                } finally {
                  setSaving(false);
                }
              }} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGrades;
