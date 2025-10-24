import React, { useEffect, useState } from 'react';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import { PlusSquare } from 'lucide-react';
import { getPrograms, getLecturers, createUser, formatApiError } from '../../utils/api';
import { useToast } from '../../components/ui/ToastContext';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, lecturers: 0, programs: 0, revenue: 0 });
  const [users, setUsers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'lecturer', password: '' });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [programsRes, lecturersRes] = await Promise.allSettled([
          getPrograms(),
          getLecturers()
        ]);

        if (!mounted) return;

        // compute simple stats from results; if result is rejected or empty, keep 0 and show empty states later
        const programs = (programsRes.status === 'fulfilled' && Array.isArray(programsRes.value)) ? programsRes.value : [];
        const lecturers = (lecturersRes.status === 'fulfilled' && Array.isArray(lecturersRes.value)) ? lecturersRes.value : [];
        setStats({
          students: 0, // students count isn't provided by current API endpoints, set 0 and let UI show empty state
          lecturers: lecturers.length,
          programs: programs.length,
          revenue: 0
        });

        // For users table show lecturers as users for now
        setUsers(lecturers.map((l, idx) => ({ id: l._id || idx + 1, name: l.name || l.fullName || 'N/A', role: 'Lecturer', email: l.email || '' })));
      } catch (e) {
        // swallow - UI will show empty states when arrays are empty
        console.error('Admin dashboard data fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"><PlusSquare size={16} /> Create User</button>
        </div>
      </div>

      <div className="gap-6">
        <main className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {loading ? (
              <div className="col-span-4 text-center py-8">Loading stats...</div>
            ) : (
              [
                { title: 'Active Students', value: stats.students || '—' },
                { title: 'Lecturers', value: stats.lecturers || '—' },
                { title: 'Programs', value: stats.programs || '—' },
                { title: 'Revenue', value: stats.revenue ? `$${stats.revenue}` : '—' }
              ].map((s, i) => (
                <StatsCard key={i} title={s.title} value={s.value} />
              ))
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
            {loading ? (
              <div className="py-8 text-center">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No users to display</div>
            ) : (
              <DataTable columns={columns} data={users} />
            )}
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create User</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full border rounded px-3 py-2" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full border rounded px-3 py-2" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full border rounded px-3 py-2" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="lecturer">Lecturer</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full border rounded px-3 py-2" />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
              <button disabled={creating} onClick={async () => {
                setCreating(true);
                try {
                  const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, password: form.password };
                  await createUser(payload);
                  setIsCreateOpen(false);
                  setForm({ name: '', email: '', role: 'lecturer', password: '' });
                  toast.push('User created', { type: 'success' });
                } catch (err) {
                  console.error('Create user failed', err);
                  toast.push(formatApiError(err) || 'Failed to create user', { type: 'error' });
                } finally {
                  setCreating(false);
                }
              }} className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
